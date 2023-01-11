import TokenType from '../nodes/TokenType';

const TokenCategoryDelimiter = 'delimiter';
const TokenCategoryRelation = 'relation';
const TokenCategoryShare = 'share';
const TokenCategoryEvaluation = 'eval';
const TokenCategoryDocs = 'docs';
const TokenCategoryLiteral = 'literal';
const TokenCategoryName = 'name';
const TokenCategoryType = 'type';
const TokenCategoryOperator = 'operator';
const TokenCategoryUnknown = 'unknown';
const TokenCategoryPlaceholder = 'placeholder';
const TokenCategoryEnd = 'end';

const TokenCategories: Map<TokenType, string> = new Map();
TokenCategories.set(TokenType.EVAL_OPEN, TokenCategoryDelimiter);
TokenCategories.set(TokenType.EVAL_CLOSE, TokenCategoryDelimiter);
TokenCategories.set(TokenType.SET_OPEN, TokenCategoryDelimiter);
TokenCategories.set(TokenType.SET_CLOSE, TokenCategoryDelimiter);
TokenCategories.set(TokenType.LIST_OPEN, TokenCategoryDelimiter);
TokenCategories.set(TokenType.LIST_CLOSE, TokenCategoryDelimiter);
TokenCategories.set(TokenType.TABLE_OPEN, TokenCategoryDelimiter);
TokenCategories.set(TokenType.TABLE_CLOSE, TokenCategoryDelimiter);
TokenCategories.set(TokenType.TYPE_OPEN, TokenCategoryDelimiter);
TokenCategories.set(TokenType.TYPE_CLOSE, TokenCategoryDelimiter);
TokenCategories.set(TokenType.BIND, TokenCategoryRelation);
TokenCategories.set(TokenType.ACCESS, TokenCategoryRelation);
TokenCategories.set(TokenType.FUNCTION, TokenCategoryEvaluation);
TokenCategories.set(TokenType.BORROW, TokenCategoryShare);
TokenCategories.set(TokenType.SHARE, TokenCategoryShare);
TokenCategories.set(TokenType.CONVERT, TokenCategoryEvaluation);
TokenCategories.set(TokenType.DOC, TokenCategoryDocs);
TokenCategories.set(TokenType.WORDS, TokenCategoryDocs);
TokenCategories.set(TokenType.NONE, TokenCategoryLiteral);
TokenCategories.set(TokenType.TYPE, TokenCategoryRelation);
TokenCategories.set(TokenType.NAME_SEPARATOR, TokenCategoryDelimiter);
TokenCategories.set(TokenType.LANGUAGE, TokenCategoryDelimiter);
TokenCategories.set(TokenType.BOOLEAN_TYPE, TokenCategoryLiteral);
TokenCategories.set(TokenType.NUMBER_TYPE, TokenCategoryType);
TokenCategories.set(TokenType.JAPANESE, TokenCategoryLiteral);
TokenCategories.set(TokenType.ROMAN, TokenCategoryLiteral);
TokenCategories.set(TokenType.PI, TokenCategoryLiteral);
TokenCategories.set(TokenType.INFINITY, TokenCategoryLiteral);
TokenCategories.set(TokenType.NONE_TYPE, TokenCategoryType);
TokenCategories.set(TokenType.SELECT, TokenCategoryOperator);
TokenCategories.set(TokenType.INSERT, TokenCategoryOperator);
TokenCategories.set(TokenType.UPDATE, TokenCategoryOperator);
TokenCategories.set(TokenType.DELETE, TokenCategoryOperator);
TokenCategories.set(TokenType.UNION, TokenCategoryOperator);
TokenCategories.set(TokenType.REACTION, TokenCategoryOperator);
TokenCategories.set(TokenType.STREAM_TYPE, TokenCategoryType);
TokenCategories.set(TokenType.PREVIOUS, TokenCategoryOperator);
TokenCategories.set(TokenType.CHANGE, TokenCategoryOperator);
TokenCategories.set(TokenType.PLACEHOLDER, TokenCategoryPlaceholder);
TokenCategories.set(TokenType.UNARY_OP, TokenCategoryOperator);
TokenCategories.set(TokenType.BINARY_OP, TokenCategoryOperator);
TokenCategories.set(TokenType.CONDITIONAL, TokenCategoryOperator);
TokenCategories.set(TokenType.TEXT, TokenCategoryLiteral);
TokenCategories.set(TokenType.TEXT_OPEN, TokenCategoryLiteral);
TokenCategories.set(TokenType.TEXT_BETWEEN, TokenCategoryLiteral);
TokenCategories.set(TokenType.TEXT_CLOSE, TokenCategoryLiteral);
TokenCategories.set(TokenType.NUMBER, TokenCategoryLiteral);
TokenCategories.set(TokenType.DECIMAL, TokenCategoryLiteral);
TokenCategories.set(TokenType.BASE, TokenCategoryLiteral);
TokenCategories.set(TokenType.BOOLEAN, TokenCategoryLiteral);
TokenCategories.set(TokenType.NAME, TokenCategoryName);
TokenCategories.set(TokenType.END, TokenCategoryEnd);
TokenCategories.set(TokenType.UNKNOWN, TokenCategoryUnknown);

export default TokenCategories;
