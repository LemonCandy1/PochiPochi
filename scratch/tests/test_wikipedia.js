"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wikipedia_1 = require("../src/utils/wikipedia");
const questions_1 = require("../src/data/questions");
const triviaApiClient_1 = require("../src/services/api/triviaApiClient");
function runWikipediaTests() {
    console.log('--- Testing Wikipedia URL Resolution & Verification ---');
    // Test 1: Slug Generation
    const slug1 = (0, wikipedia_1.getWikipediaSlug)('GOLD');
    if (slug1 !== 'Gold')
        throw new Error(`Expected 'Gold', got '${slug1}'`);
    const slug2 = (0, wikipedia_1.getWikipediaSlug)('DEAD SEA');
    if (slug2 !== 'Dead_Sea')
        throw new Error(`Expected 'Dead_Sea', got '${slug2}'`);
    const slug3 = (0, wikipedia_1.getWikipediaSlug)('The Eiffel Tower');
    if (slug3 !== 'Eiffel_Tower')
        throw new Error(`Expected 'Eiffel_Tower', got '${slug3}'`);
    const slug4 = (0, wikipedia_1.getWikipediaSlug)('DNA');
    if (slug4 !== 'DNA')
        throw new Error(`Expected 'DNA', got '${slug4}'`);
    const slug5 = (0, wikipedia_1.getWikipediaSlug)('Paris (France)');
    if (slug5 !== 'Paris')
        throw new Error(`Expected 'Paris', got '${slug5}'`);
    console.log('✓ Slug Generation Tests Passed');
    // Test 2: URL Formatting
    const url1 = (0, wikipedia_1.formatWikipediaUrl)('GOLD');
    if (url1 !== 'https://en.wikipedia.org/wiki/Gold') {
        throw new Error(`Expected https://en.wikipedia.org/wiki/Gold, got ${url1}`);
    }
    const url2 = (0, wikipedia_1.formatWikipediaUrl)('DEAD SEA');
    if (url2 !== 'https://en.wikipedia.org/wiki/Dead_Sea') {
        throw new Error(`Expected https://en.wikipedia.org/wiki/Dead_Sea, got ${url2}`);
    }
    // Preserve valid explicit URL
    const url3 = (0, wikipedia_1.formatWikipediaUrl)('EVEREST', 'https://en.wikipedia.org/wiki/Mount_Everest');
    if (url3 !== 'https://en.wikipedia.org/wiki/Mount_Everest') {
        throw new Error(`Expected preserved Mount_Everest, got ${url3}`);
    }
    // Fallback when explicit URL is empty or invalid
    const url4 = (0, wikipedia_1.formatWikipediaUrl)('JUPITER', '');
    if (url4 !== 'https://en.wikipedia.org/wiki/Jupiter') {
        throw new Error(`Expected fallback to Jupiter, got ${url4}`);
    }
    console.log('✓ URL Formatting Tests Passed');
    // Test 3: Verify all INITIAL_QUESTIONS
    console.log(`Checking ${questions_1.INITIAL_QUESTIONS.length} INITIAL_QUESTIONS...`);
    for (const q of questions_1.INITIAL_QUESTIONS) {
        if (!q.wikipedia_url || !q.wikipedia_url.startsWith('https://en.wikipedia.org/wiki/')) {
            throw new Error(`Question ${q.id} missing valid wikipedia_url: ${q.wikipedia_url}`);
        }
        const slug = q.wikipedia_url.replace('https://en.wikipedia.org/wiki/', '');
        if (!slug || slug.length === 0) {
            throw new Error(`Question ${q.id} has empty article slug`);
        }
    }
    console.log('✓ All INITIAL_QUESTIONS have verified Wikipedia URLs matching their answers');
    // Test 4: Verify all ALL_INTRODUCTORY_QUESTIONS
    console.log(`Checking ${questions_1.ALL_INTRODUCTORY_QUESTIONS.length} ALL_INTRODUCTORY_QUESTIONS...`);
    for (const q of questions_1.ALL_INTRODUCTORY_QUESTIONS) {
        if (!q.wikipedia_url || !q.wikipedia_url.startsWith('https://en.wikipedia.org/wiki/')) {
            throw new Error(`Question ${q.id} missing valid wikipedia_url: ${q.wikipedia_url}`);
        }
        const slug = q.wikipedia_url.replace('https://en.wikipedia.org/wiki/', '');
        if (!slug || slug.length === 0) {
            throw new Error(`Question ${q.id} has empty article slug`);
        }
    }
    console.log('✓ All ALL_INTRODUCTORY_QUESTIONS have verified Wikipedia URLs matching their answers');
    // Test 5: Verify all BUNDLED_JARCHIVE_CLUES
    console.log(`Checking ${triviaApiClient_1.BUNDLED_JARCHIVE_CLUES.length} BUNDLED_JARCHIVE_CLUES...`);
    for (let i = 0; i < triviaApiClient_1.BUNDLED_JARCHIVE_CLUES.length; i++) {
        const clue = triviaApiClient_1.BUNDLED_JARCHIVE_CLUES[i];
        const converted = triviaApiClient_1.TriviaApiClient.convertJArchiveToQuestion(clue, i);
        if (!converted.wikipedia_url || !converted.wikipedia_url.startsWith('https://en.wikipedia.org/wiki/')) {
            throw new Error(`J! clue ${clue.answer} missing valid wikipedia_url: ${converted.wikipedia_url}`);
        }
    }
    console.log('✓ All BUNDLED_JARCHIVE_CLUES have verified Wikipedia URLs matching their answers');
    console.log('\nAll Wikipedia URL Verification Tests Passed Successfully! 🎉');
}
runWikipediaTests();
