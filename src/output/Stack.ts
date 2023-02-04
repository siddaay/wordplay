import toStructure from '../native/toStructure';
import type Value from '@runtime/Value';
import type Color from './Color';
import Group from './Group';
import type { RenderContext } from './RenderContext';
import { toGroups } from './toGroups';
import Place from './Place';
import Decimal from 'decimal.js';
import type LanguageCode from '@translation/LanguageCode';
import { getPreferredTranslation } from '@translation/getPreferredTranslation';
import { getBind } from '@translation/getBind';
import Phrase from './Phrase';

export const StackType = toStructure(`
    ${getBind((t) => t.output.stack.definition, '•')} Group(
        ${getBind((t) => t.output.stack.phrases)}…•Group
    )
`);

export class Stack extends Group {
    readonly groups: Group[] = [];
    readonly padding = new Decimal(1);

    constructor(value: Value, phrases: Group[]) {
        super(value);

        this.groups = phrases;
    }

    // Width is the max width
    getWidth(context: RenderContext): Decimal {
        return this.groups.reduce(
            (max, group) => Decimal.max(max, group.getWidth(context)),
            new Decimal(0)
        );
    }

    // Height is the sum of heights plus padding
    getHeight(context: RenderContext): Decimal {
        return this.groups
            .reduce(
                (height, group) => height.add(group.getHeight(context)),
                new Decimal(0)
            )
            .add(this.padding.times(this.groups.length - 1));
    }

    getGroups(): Group[] {
        return this.groups;
    }

    getPlaces(context: RenderContext): [Group, Place][] {
        // Start at half the height, so we can center everything.
        let position = new Decimal(0);

        // Get the width of the container so we can center each phrase.
        let width = this.getWidth(context);

        const positions: [Group, Place][] = [];
        for (const group of this.groups) {
            positions.push([
                group,
                new Place(
                    this.value,
                    width.sub(group.getWidth(context)).div(2),
                    position,
                    // If the phrase a place, use it's z, otherwise default to the 0 plane.
                    group instanceof Phrase && group.place
                        ? group.place.z
                        : new Decimal(0),
                    // Use the place's rotation if provided
                    group instanceof Phrase && group.place
                        ? group.place.rotation
                        : new Decimal(0)
                ),
            ]);
            position = position.add(group.getHeight(context));
            position = position.add(this.padding);
        }

        return positions;
    }

    getBackground(): Color | undefined {
        return undefined;
    }

    getDescription(languages: LanguageCode[]) {
        return getPreferredTranslation(languages).output.stack.description;
    }
}

export function toStack(value: Value | undefined): Stack | undefined {
    if (value === undefined) return undefined;
    const phrases = toGroups(
        value.resolve(StackType.inputs[0].names.getNames()[0])
    );
    return phrases ? new Stack(value, phrases) : undefined;
}
