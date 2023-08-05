import type StructureDefinition from '@nodes/StructureDefinition';
import StructureType from '@nodes/StructureType';
import type Type from '@nodes/Type';
import type Conversion from './Conversion';
import Evaluation, { type EvaluationNode } from './Evaluation';
import type Evaluator from './Evaluator';
import FunctionValue from './FunctionValue';
import Value from './Value';
import Number from './Number';
import Text from './Text';
import Bool from './Bool';
import type Names from '@nodes/Names';
import {
    BIND_SYMBOL,
    EVAL_CLOSE_SYMBOL,
    EVAL_OPEN_SYMBOL,
} from '@parser/Symbols';
import type { BasisTypeName } from '../basis/BasisConstants';
import type Locale from '@locale/Locale';
import type Expression from '../nodes/Expression';
import concretize from '../locale/concretize';

export default class Structure extends Value {
    readonly type: StructureDefinition;
    readonly context: Evaluation;

    constructor(creator: Expression, context: Evaluation) {
        super(creator);

        this.type = context.getDefinition() as StructureDefinition;
        this.context = context;
    }

    /**
     * A structure is equal to another structure if all of its bindings are equal and they have the same definition.
     */
    isEqualTo(structure: Value): boolean {
        if (
            !(structure instanceof Structure) ||
            !this.type.isEqualTo(structure.type)
        )
            return false;

        const thisBindings = this.context.getBindings();
        const thatBindings = structure.context.getBindings();

        if (thisBindings[0].size !== thatBindings[0].size) return false;

        return Array.from(thisBindings[0].keys()).every((key, index) => {
            const thisKey = typeof key === 'string' ? key : key.getNames()[0];
            const thisValue = thisBindings[0].get(thisKey);
            const thatValue = thatBindings[0].get(thisKey);
            return (
                thisValue !== undefined &&
                thatValue !== undefined &&
                thisValue.isEqualTo(thatValue)
            );
        });
    }

    is(type: StructureDefinition) {
        return this.type === type;
    }

    getType() {
        return new StructureType(this.type, []);
    }

    getBasisTypeName(): BasisTypeName {
        return 'structure';
    }

    resolve(name: string | Names, evaluator?: Evaluator): Value | undefined {
        const value = this.context.resolve(name);
        if (value !== undefined) return value;
        const basisFun =
            evaluator && typeof name === 'string'
                ? evaluator
                      .getBasis()
                      .getFunction(this.getBasisTypeName(), name)
                : undefined;
        return basisFun === undefined
            ? undefined
            : new FunctionValue(basisFun, this);
    }

    getNumber(name: string): number | undefined {
        const measurement = this.resolve(name);
        if (measurement instanceof Number) return measurement.toNumber();
        return undefined;
    }

    getBool(name: string): boolean | undefined {
        const bool = this.resolve(name);
        if (bool instanceof Bool) return bool.bool;
        return undefined;
    }

    getText(name: string): string | undefined {
        const text = this.resolve(name);
        if (text instanceof Text) return text.text.toString();
        return undefined;
    }

    getConversion(input: Type, output: Type): Conversion | undefined {
        return this.context.getConversion(input, output);
    }

    toWordplay(locales: Locale[]): string {
        const bindings = this.type.inputs.map(
            (bind) =>
                `${bind.names.getPreferredNameString(
                    locales
                )}${BIND_SYMBOL} ${this.resolve(bind.getNames()[0])}`
        );
        return `${this.type.names.getPreferredNameString(
            locales
        )}${EVAL_OPEN_SYMBOL}${bindings.join(' ')}${EVAL_CLOSE_SYMBOL}`;
    }

    getDescription(locale: Locale) {
        return concretize(locale, locale.term.structure);
    }

    /**
     * Clone this structure, but with a new value for the given property.
     * If the property doesn't exist, then return undefined.
     */
    withValue(
        creator: EvaluationNode,
        property: string,
        value: Value
    ): Structure | undefined {
        const newContext = this.context.withValue(creator, property, value);
        return newContext ? new Structure(creator, newContext) : undefined;
    }

    getSize() {
        return this.context.getSize();
    }
}

export function createStructure(
    evaluator: Evaluator,
    definition: StructureDefinition,
    values: Map<Names, Value>
): Structure {
    return new Structure(
        definition,
        new Evaluation(
            evaluator,
            evaluator.getMain(),
            definition,
            undefined,
            values
        )
    );
}
