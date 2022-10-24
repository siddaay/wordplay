import Node from "./Node";
import Token from "./Token";
import type Conflict from "../conflicts/Conflict";
import Language from "./Language";
import UnnamedAlias from "../conflicts/UnnamedAlias";
import type Context from "./Context";
import { getPossibleLanguages } from "../transforms/getPossibleLanguages";
import { PLACEHOLDER_SYMBOL } from "../parser/Tokenizer";
import type Transform from "../transforms/Transform";
import Replace from "../transforms/Replace";
import Add from "../transforms/Add";
import type LanguageCode from "./LanguageCode";
import NameToken from "./NameToken";
import PlaceholderToken from "./PlaceholderToken";
import Remove from "../transforms/Remove";
import type Translations from "./Translations";

export const NameLabels: Translations = {
    eng: "name"
};

export default class Alias extends Node {

    readonly separator?: Token;
    readonly name?: Token;
    readonly lang?: Language;

    constructor(name?: Token | string, lang?: Language | string, separator?: Token) {
        super();

        this.separator = separator;
        this.name = typeof name === "string" ? new NameToken(name) : name instanceof Token ? name : new PlaceholderToken();
        this.lang = typeof lang === "string" ? new Language(lang) : lang;
    }

    clone(pretty: boolean=false, original?: Node | string, replacement?: Node) { 
        return new Alias(
            this.cloneOrReplaceChild(pretty, [ Token, undefined], "name", this.name, original, replacement), 
            this.cloneOrReplaceChild(pretty, [ Language, undefined], "lang", this.lang, original, replacement),
            this.cloneOrReplaceChild(pretty, [ Token, undefined], "separator", this.separator, original, replacement)
        ) as this;
    }

    computeChildren() { 
        const children = [];
        if(this.separator instanceof Token) children.push(this.separator);
        if(this.name instanceof Token) children.push(this.name);
        if(this.lang instanceof Language) children.push(this.lang);
        return children;
    }

    computeConflicts(): Conflict[] {
    
        if(this.name === undefined || this.name.getText() === PLACEHOLDER_SYMBOL) return [ new UnnamedAlias(this) ];

        return []; 
    
    }

    getName(): string | undefined { return this.name instanceof Token ? this.name.text.toString() : this.name; }
    getLanguage() { return this.lang === undefined ? undefined : this.lang.getLanguage(); }
    isLanguage(lang: LanguageCode) { return this.getLanguage() === lang as LanguageCode; }

    equals(alias: Alias) { 

        const thisLang = this.lang;
        const thatLang = alias.lang;

        return this.getName() === alias.getName() && (
            (thisLang === undefined && thatLang === undefined) ||
            (thisLang !== undefined && thatLang !== undefined && thisLang.equals(thatLang))
        );
    }

    getDescriptions() {
        return {
            eng: "A name"
        }
    }

    getChildReplacement(child: Node, context: Context): Transform[] | undefined {

        const project = context.source.getProject();
        // Formats can be any Language tags that are used in the project.
        if(child === this.lang && project !== undefined)
            return getPossibleLanguages(project).map(lang => new Replace(context.source, child, new Language(lang)));

        }

    getInsertionBefore(): Transform[] | undefined { return undefined; }

    getInsertionAfter(context: Context, position: number): Transform[] | undefined {

        const project = context.source.getProject();
        // Suggest languages for insertion if after the name with no language.
        if(this.lang === undefined && project !== undefined)
            return getPossibleLanguages(project).map(lang => new Add(context.source, position, this, "lang", new Language(lang)));

    }

    getChildRemoval(child: Node, context: Context): Transform | undefined {
        
        if(child === this.name) return new Replace(context.source, child, new PlaceholderToken());
        else if(child === this.lang) return new Remove(context.source, this, this.lang);

    }

    getChildPlaceholderLabel(child: Node): Translations | undefined {
        if(child === this.name) return NameLabels;
    }

}

