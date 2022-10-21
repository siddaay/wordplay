import type Conflict from "../conflicts/Conflict";
import Expression from "./Expression";
import Token from "./Token";
import type Type from "./Type";
import type Node from "./Node";
import UnknownType from "./UnknownType";
import type Value from "../runtime/Value";
import type Step from "../runtime/Step";
import Placeholder from "../conflicts/Placeholder";
import Halt from "../runtime/Halt";
import type Bind from "./Bind";
import type Context from "./Context";
import type { TypeSet } from "./UnionType";
import SemanticException from "../runtime/SemanticException";
import type Evaluator from "../runtime/Evaluator";
import UnimplementedException from "../runtime/UnimplementedException";
import type Translations from "./Translations";
import PlaceholderToken from "./PlaceholderToken";
import { getPossiblePostfix } from "../transforms/getPossibleExpressions";
import type Transform from "../transforms/Transform";

export default class ExpressionPlaceholder extends Expression {
    
    readonly etc: Token;

    constructor(etc?: Token) {
        super();
        this.etc = etc ?? new PlaceholderToken();
    }

    computeChildren() { return [ this.etc ]; }

    computeConflicts(): Conflict[] { 
        return [ new Placeholder(this) ];
    }

    computeType(): Type { return new UnknownType(this); }

    compile(): Step[] {
        return [ new Halt(evaluator => new UnimplementedException(evaluator), this) ];
    }

    getStartExplanations() { 
        return {
            "eng": "Can't evaluate a placeholder."
        }
     }

    getFinishExplanations() {
        return {
            "eng": "Can't evaluate a placeholder."
        }
    }

    evaluate(evaluator: Evaluator): Value {
        return new SemanticException(evaluator, this);
    }

    clone(pretty: boolean=false, original?: Node | string, replacement?: Node) { 
        return new ExpressionPlaceholder(
            this.cloneOrReplaceChild(pretty, [ Token ], "etc", this.etc, original, replacement)
        ) as this; 
    }

    evaluateTypeSet(bind: Bind, original: TypeSet, current: TypeSet, context: Context) { bind; original; context; return current; }

    getDescriptions(): Translations {
        return {
            eng: "An expression placeholder"
        }
    }
 
    getReplacementChild() { return undefined; }
    getInsertionBefore() { return undefined; }
    getInsertionAfter(context: Context): Transform[] | undefined { return getPossiblePostfix(context, this, this.getType(context)); }

}