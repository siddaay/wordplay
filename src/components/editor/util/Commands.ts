import type Caret from '../../../edit/Caret';
import Node from '@nodes/Node';
import {
    CONVERT_SYMBOL,
    FALSE_SYMBOL,
    FUNCTION_SYMBOL,
    STREAM_SYMBOL,
    TRUE_SYMBOL,
    TYPE_SYMBOL,
    PRODUCT_SYMBOL,
    QUOTIENT_SYMBOL,
} from '@parser/Symbols';

import type Source from '@nodes/Source';
import { toClipboard } from './Clipboard';
import type Evaluator from '@runtime/Evaluator';
import FunctionDefinition from '@nodes/FunctionDefinition';
import ExpressionPlaceholder from '@nodes/ExpressionPlaceholder';
import Names from '@nodes/Names';
import type { Creator } from '../../../db/Creator';
import type { Locale } from '../../../locale/Locale';

export type Edit = Caret | Revision;
export type Revision = [Source, Caret];
export enum Visibility {
    Visible = 'visible',
    Touch = 'touch',
    Invisible = 'invisible ',
}
export enum Category {
    Cursor = 'cursor',
    Insert = 'insert',
    Modify = 'modify',
    Evaluate = 'evaluate',
}

export type Command = {
    /** The iconographic text symbol to use */
    symbol: string;
    /** Gets the locale string from a locale for use in title and aria-label of UI  */
    description: (locale: Locale) => string;
    /** True if it should be a control in the toolbar */
    visible: Visibility;
    /** The category of command, used to decide where to display controls if visible */
    category: Category;
    /** The key that triggers the command, or if not provided, all keys trigger it */
    key?: string;
    /** If true, shift is required, if false, it's disqualifying, if undefined, it can be either */
    shift: boolean | undefined;
    /** If true, alt is required, if false, it's disqualifying, if undefined, it can be either */
    alt: boolean | undefined;
    /** If true, control or meta is required, if false, it's disqualifying, if undefined, it can be either */
    control: boolean | undefined;
    /** Generates an edit or other editor command */
    execute: (
        caret: Caret,
        key: string,
        evaluator: Evaluator,
        creator: Creator
    ) => // Process this edit
    | Edit
        // Wait and process this edit
        | Promise<Edit | undefined>
        // Handled
        | boolean
        // Not handled
        | undefined;
};

const commands: Command[] = [
    {
        symbol: '↑',
        description: (l) => l.ui.tooltip.cursorLineBefore,
        visible: Visibility.Touch,
        category: Category.Cursor,
        alt: false,
        control: false,
        shift: false,
        key: 'ArrowUp',
        execute: (caret: Caret) => caret.moveVertical(-1),
    },
    {
        symbol: '↓',
        description: (l) => l.ui.tooltip.cursorLineAfter,
        visible: Visibility.Touch,
        category: Category.Cursor,
        alt: false,
        control: false,
        shift: false,
        key: 'ArrowDown',
        execute: (caret: Caret) => caret.moveVertical(1),
    },
    {
        symbol: '←',
        description: (l) => l.ui.tooltip.cursorInlineBefore,
        visible: Visibility.Touch,
        category: Category.Cursor,
        alt: false,
        control: false,
        shift: false,
        key: 'ArrowLeft',

        execute: (caret, key, evaluator, creator) =>
            caret.moveInline(
                false,
                creator.getWritingDirection() === 'ltr' ? -1 : 1
            ),
    },
    {
        symbol: '→',
        description: (l) => l.ui.tooltip.cursorInlineAfter,
        visible: Visibility.Touch,
        category: Category.Cursor,
        alt: false,
        control: false,
        shift: false,
        key: 'ArrowRight',

        execute: (caret, key, evaluator, creator) =>
            caret.moveInline(
                false,
                creator.getWritingDirection() === 'ltr' ? 1 : -1
            ),
    },
    {
        symbol: '↖',
        description: (l) => l.ui.tooltip.cursorNeighborBefore,
        visible: Visibility.Visible,
        category: Category.Cursor,
        alt: false,
        shift: true,
        control: false,
        key: 'ArrowLeft',

        execute: (caret: Caret) => caret.left(true),
    },
    {
        symbol: '↗',
        description: (l) => l.ui.tooltip.cursorNeighborAfter,
        visible: Visibility.Visible,
        category: Category.Cursor,
        alt: false,
        control: false,
        shift: true,
        key: 'ArrowRight',

        execute: (caret: Caret) => caret.right(true),
    },
    {
        symbol: '▣',
        description: (l) => l.ui.tooltip.cursorContainer,
        visible: Visibility.Visible,
        category: Category.Cursor,
        key: 'Escape',
        alt: undefined,
        control: false,
        shift: undefined,
        execute: (caret: Caret) => {
            const position = caret.position;
            if (position instanceof Node) {
                let parent = caret.source.root.getParent(position);
                if (parent) return caret.withPosition(parent);
            }
            // Find the node corresponding to the position.
            // And if it's parent only has the one child, select it.
            else {
                const token =
                    caret.atTokenEnd() && caret.hasSpaceAfter()
                        ? caret.tokenPrior
                        : caret.getToken();
                if (token !== undefined) {
                    const parent = caret.source.root.getParent(token);
                    return caret.withPosition(
                        parent?.getChildren()[0] === token ? parent : token
                    );
                }
            }
        },
    },
    {
        symbol: '▮',
        description: (l) => l.ui.tooltip.selectAll,
        visible: Visibility.Visible,
        category: Category.Cursor,
        alt: false,
        shift: false,
        control: true,
        key: 'KeyA',
        execute: (caret: Caret) => caret.withPosition(caret.getProgram()),
    },
    {
        symbol: '+',
        description: (l) => l.ui.tooltip.incrementLiteral,
        visible: Visibility.Touch,
        category: Category.Modify,
        control: false,
        alt: true,
        shift: false,
        key: 'ArrowUp',
        execute: (caret: Caret) => caret.adjustLiteral(undefined, 1),
    },
    {
        symbol: '-',
        description: (l) => l.ui.tooltip.decrementLiteral,
        visible: Visibility.Touch,
        category: Category.Modify,
        shift: false,
        control: false,
        alt: true,
        key: 'ArrowDown',
        execute: (caret: Caret) => caret.adjustLiteral(undefined, -1),
    },
    {
        symbol: STREAM_SYMBOL,
        description: (l) => l.ui.tooltip.insertStreamSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'Semicolon',
        execute: (caret: Caret) => caret.insert(STREAM_SYMBOL),
    },
    {
        symbol: CONVERT_SYMBOL,
        description: (l) => l.ui.tooltip.insertConvertSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'ArrowRight',
        execute: (caret: Caret) => caret.insert(CONVERT_SYMBOL),
    },
    {
        symbol: TRUE_SYMBOL,
        description: (l) => l.ui.tooltip.insertTrueSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'Digit1',
        execute: (caret: Caret) => caret.insert(TRUE_SYMBOL),
    },
    {
        symbol: FALSE_SYMBOL,
        description: (l) => l.ui.tooltip.insertFalseSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'Digit0',
        execute: (caret: Caret) => caret.insert(FALSE_SYMBOL),
    },
    {
        symbol: TYPE_SYMBOL,
        description: (l) => l.ui.tooltip.insertFalseSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'Digit8',

        execute: (caret: Caret) => caret.insert(TYPE_SYMBOL),
    },
    {
        symbol: '≠',
        description: (l) => l.ui.tooltip.insertNotEqualSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'Equal',
        execute: (caret: Caret) => caret.insert('≠'),
    },
    {
        symbol: PRODUCT_SYMBOL,
        description: (l) => l.ui.tooltip.insertProductSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'x',
        execute: (caret: Caret) => caret.insert(PRODUCT_SYMBOL),
    },
    {
        symbol: QUOTIENT_SYMBOL,
        description: (l) => l.ui.tooltip.insertQuotientSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        shift: false,
        control: false,
        key: 'Slash',
        execute: (caret: Caret) => caret.insert(QUOTIENT_SYMBOL),
    },
    {
        symbol: FUNCTION_SYMBOL,
        description: (l) => l.ui.tooltip.insertFunctionSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        alt: true,
        key: 'KeyF',
        shift: false,
        control: false,
        execute: (caret: Caret) =>
            caret.insertNode(
                FunctionDefinition.make(
                    undefined,
                    Names.make([]),
                    undefined,
                    [],
                    ExpressionPlaceholder.make()
                ),
                2
            ),
    },
    {
        symbol: '≤',
        description: (l) => l.ui.tooltip.insertLessThanOrEqualSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        shift: false,
        control: false,
        alt: true,
        key: 'Comma',
        execute: (caret: Caret) => caret.insert('≤'),
    },
    {
        symbol: '≥',
        description: (l) => l.ui.tooltip.insertGreaterThanOrEqualSymbol,
        visible: Visibility.Visible,
        category: Category.Insert,
        shift: false,
        control: false,
        alt: true,
        key: 'Period',
        execute: (caret: Caret) => caret.insert('≥'),
    },
    {
        symbol: '⏎',
        description: (l) => l.ui.tooltip.insertLineBreak,
        visible: Visibility.Visible,
        category: Category.Insert,
        key: 'Enter',
        shift: false,
        alt: false,
        control: false,
        execute: (caret: Caret) =>
            caret.isNode() ? caret.enter() : caret.insert('\n'),
    },
    {
        symbol: '→',
        description: (l) => l.ui.tooltip.forward,
        visible: Visibility.Visible,
        category: Category.Evaluate,
        key: 'ArrowRight',
        shift: false,
        alt: false,
        control: true,
        execute: (caret: Caret, _, evaluator) => {
            if (caret.position instanceof Node) {
                evaluator.stepToNode(caret.position);
                return caret;
            }
        },
    },
    {
        symbol: '←',
        description: (l) => l.ui.tooltip.back,
        visible: Visibility.Visible,
        category: Category.Evaluate,
        key: 'ArrowLeft',
        shift: false,
        alt: false,
        control: true,
        execute: (caret: Caret, _, evaluator) => {
            if (caret.position instanceof Node) {
                evaluator.stepBackToNode(caret.position);
                return caret;
            }
        },
    },
    {
        symbol: '⌫',
        description: (l) => l.ui.tooltip.backspace,
        visible: Visibility.Touch,
        category: Category.Modify,
        key: 'Backspace',
        shift: false,
        control: false,
        alt: false,
        execute: (caret: Caret) => caret.backspace(),
    },
    {
        symbol: '📋',
        description: (l) => l.ui.tooltip.copy,
        visible: Visibility.Visible,
        category: Category.Modify,
        control: true,
        shift: false,
        alt: false,
        key: 'KeyC',
        execute: (caret: Caret) => {
            if (!(caret.position instanceof Node)) return undefined;
            return toClipboard(caret.position, caret.source.spaces);
        },
    },
    {
        symbol: '✂️',
        description: (l) => l.ui.tooltip.cut,
        visible: Visibility.Visible,
        category: Category.Modify,
        control: true,
        shift: false,
        alt: false,
        key: 'KeyX',
        execute: (caret: Caret) => {
            if (!(caret.position instanceof Node)) return undefined;
            toClipboard(caret.position, caret.source.spaces);
            return caret.backspace();
        },
    },
    {
        symbol: '📚',
        description: (l) => l.ui.tooltip.paste,
        visible: Visibility.Visible,
        category: Category.Modify,
        control: true,
        shift: false,
        alt: false,
        key: 'KeyV',
        execute: async (caret: Caret) => {
            // See if there's something on the clipboard.
            if (navigator.clipboard === undefined) return undefined;

            const items = await navigator.clipboard.read();
            for (const item of items) {
                for (const type of item.types) {
                    if (type === 'text/plain') {
                        const blob = await item.getType(type);
                        const text = await blob.text();
                        return caret.insert(text);
                    }
                }
            }
            return undefined;
        },
    },
    {
        symbol: '()',
        description: (l) => l.ui.tooltip.parenthesize,
        visible: Visibility.Visible,
        category: Category.Modify,
        key: '(',
        control: false,
        shift: undefined,
        alt: undefined,
        execute: (caret: Caret) => caret.wrap('('),
    },
    {
        symbol: '[]',
        description: (l) => l.ui.tooltip.enumerate,
        visible: Visibility.Visible,
        category: Category.Modify,
        control: undefined,
        shift: undefined,
        alt: undefined,
        key: '[',
        execute: (caret: Caret) => caret.wrap('['),
    },
    {
        symbol: 'a',
        description: (l) => l.ui.tooltip.type,
        visible: Visibility.Invisible,
        category: Category.Modify,
        control: false,
        shift: undefined,
        alt: undefined,
        execute: (caret, key) =>
            key.length === 1 ? caret.insert(key) : undefined,
    },
    {
        symbol: '↩',
        description: (l) => l.ui.tooltip.undo,
        visible: Visibility.Visible,
        category: Category.Modify,
        shift: false,
        control: true,
        alt: false,
        key: 'z',

        execute: (caret, key, evaluator, creator) =>
            creator.undoProject(evaluator.project.id) === true,
    },
    {
        symbol: '↪',
        description: (l) => l.ui.tooltip.redo,
        visible: Visibility.Visible,
        category: Category.Modify,
        shift: true,
        control: true,
        alt: false,
        key: 'z',

        execute: (caret, key, evaluator, creator) =>
            creator.redoProject(evaluator.project.id) === true,
    },
];

export default commands;
