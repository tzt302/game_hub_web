import test from 'node:test';
import assert from 'node:assert/strict';
import '../i18n.js';

const i18n = globalThis.TZT_I18N;
const requiredUi = ['metaTitle','metaDescription','brandTagline','navLobby','languageAria','heroTitle','searchPlaceholder','featuredTitle','allGames','tableGames','racingGames','strategyGames','comingSoon','previewLabel','playNow','reservedTitle','contactAuthor'];

test('ships all requested languages with complete lobby copy', () => {
  assert.deepEqual(i18n.SUPPORTED, ['en','ja','fr','es','ru','it','ar','ko','zh-CN','zh-TW','pt']);
  for (const locale of i18n.SUPPORTED) {
    const dictionary = i18n.translations[locale];
    assert.ok(dictionary, `missing ${locale}`);
    for (const key of requiredUi) assert.ok(dictionary.ui[key], `${locale} missing ${key}`);
    for (const game of ['mahjong','racing','poker','spider','minesweeper','2048']) {
      assert.ok(dictionary.games[game].title, `${locale} missing ${game} title`);
      assert.equal(dictionary.games[game].features.length, 3, `${locale} ${game} feature count`);
    }
  }
});

test('maps Cloudflare countries to the intended locale', () => {
  assert.equal(i18n.resolveCountry('CN'), 'zh-CN');
  assert.equal(i18n.resolveCountry('TW'), 'zh-TW');
  assert.equal(i18n.resolveCountry('JP'), 'ja');
  assert.equal(i18n.resolveCountry('KR'), 'ko');
  assert.equal(i18n.resolveCountry('FR'), 'fr');
  assert.equal(i18n.resolveCountry('MX'), 'es');
  assert.equal(i18n.resolveCountry('RU'), 'ru');
  assert.equal(i18n.resolveCountry('IT'), 'it');
  assert.equal(i18n.resolveCountry('SA'), 'ar');
  assert.equal(i18n.resolveCountry('BR'), 'pt');
  assert.equal(i18n.resolveCountry('US'), 'en');
});

test('normalises browser locales and enables RTL only for Arabic', () => {
  assert.equal(i18n.normaliseLocale('zh-Hant-HK'), 'zh-TW');
  assert.equal(i18n.normaliseLocale('pt-BR'), 'pt');
  assert.equal(i18n.normaliseLocale('de-DE'), 'en');
  assert.equal(i18n.getDirection('ar'), 'rtl');
  assert.equal(i18n.getDirection('ja'), 'ltr');
});
