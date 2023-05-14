import SupportedLocales from './locales';
import Docs from '@nodes/Docs';
import type { DocText } from './Locale';
import type Locale from './Locale';
import { localeToLanguage } from './localeToLanguage';
import { parseLocaleDoc } from '@parser/Parser';

export function getDocLocales(select: (translation: Locale) => DocText): Docs {
    return new Docs(
        SupportedLocales.map((translation) =>
            parseLocaleDoc(select(translation)).withLanguage(
                localeToLanguage(translation)
            )
        )
    );
}