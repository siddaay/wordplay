import Node from "./Node";
import type ColumnType from "./ColumnType";
import type Program from "./Program";
import type Conflict from "./Conflict";
import type Type from "./Type";

export default class TableType extends Node {
    
    readonly columns: ColumnType[];

    constructor(columns: ColumnType[]) {
        super();

        this.columns = columns;
    }

    getChildren() { return [ ...this.columns ]; }

    getConflicts(program: Program): Conflict[] { return []; }

    isCompatible(program: Program, type: Type) {

        if(!(type instanceof TableType)) return false;
        if(this.columns.length !== type.columns.length) return false;    
        for(let i = 0; i < this.columns.length; i++)
            if(!this.columns[i].isCompatible(program, type.columns[i]))
                return false;
        return true;

    }
     
}