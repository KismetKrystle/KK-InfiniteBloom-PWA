/**
 * SEED SCRIPT: Infinite Bloom Insights & Poetry Lines
 * Populates the `insights` table (created by
 * migrations/0012_add_insights_table.sql) with all 143 insights and 22
 * poem lines.
 *
 * USAGE: npm run seed:insights
 *
 * REQUIRES:
 * - DATABASE_URL in .env.local
 */

import { Client } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

interface Insight {
  insightNumber: number
  content: string
  sourceType: 'insight' | 'poem-line'
  sourcePoemNumber?: number
  sourcePoemTitle?: string
  pageNumber?: number
}

const INSIGHTS: Insight[] = [
  // SECTION: Insights (Official)
  {
    insightNumber: 1,
    content: 'Before knowing anyone cared about my words, I was fine.',
    sourceType: 'insight',
    pageNumber: 10,
  },
  {
    insightNumber: 2,
    content: 'Behold speak honestly.',
    sourceType: 'insight',
    pageNumber: 16,
  },
  {
    insightNumber: 3,
    content: 'You are not exempt from karma because you\'re "just doing your job".',
    sourceType: 'insight',
    pageNumber: 17,
  },
  {
    insightNumber: 4,
    content: 'Choose your perspective wisely, the quality of your life depends on it.',
    sourceType: 'insight',
    pageNumber: 20,
  },
  {
    insightNumber: 5,
    content: 'No matter where you stand in nature, it always feels like you are in the heart of it. What a time it will be, when the same can be said about standing in a forest of people.',
    sourceType: 'insight',
    pageNumber: 21,
  },
  {
    insightNumber: 6,
    content: 'Everyone has the potential to be a phenomenal version of themselves, but without willpower, one will roam the forest of could-bes indefinitely.',
    sourceType: 'insight',
    pageNumber: 25,
  },
  {
    insightNumber: 7,
    content: 'Unleash the treasures of heaven in mind, limited only by beliefs regurgitated inside.',
    sourceType: 'insight',
    pageNumber: 28,
  },
  {
    insightNumber: 8,
    content: 'Involution does not occur by default, it comes by way of consistent effort and the active practice to improve.',
    sourceType: 'insight',
    pageNumber: 28,
  },
  {
    insightNumber: 9,
    content: 'If you have found a savior, you are almost there, understand the root of their teachings, and apply it to yourself, it doesn\'t really count until you\'ve learned to save yourself.',
    sourceType: 'insight',
    pageNumber: 29,
  },
  {
    insightNumber: 10,
    content: 'The true identity of an artist is secluded; having no followers, no additional seats besides their heart to be filled; no audience to impress beyond the soul\'s attention to appeal; and no mind outside their own, to make it real.',
    sourceType: 'insight',
    pageNumber: 31,
  },
  {
    insightNumber: 11,
    content: 'When will man evolve into divine understanding, to see itself in all that surrounds it? So lost in the pursuit of being more valuable than another, it creates a wormhole of confusion.',
    sourceType: 'insight',
    pageNumber: 35,
  },
  {
    insightNumber: 12,
    content: 'Hate is hate, regardless of the excuse and perspective that follows.',
    sourceType: 'insight',
    pageNumber: 35,
  },
  {
    insightNumber: 13,
    content: 'As authors of reality, we draft the stories of our history and the premonitions of our future.',
    sourceType: 'insight',
    pageNumber: 39,
  },
  {
    insightNumber: 14,
    content: 'Don\'t allow the details of someone else\'s life ruin the perspective of yours.',
    sourceType: 'insight',
    pageNumber: 40,
  },
  {
    insightNumber: 15,
    content: 'Unless your beliefs are protected by a shielding truth, you become waves to an ocean of influential opinions, perspectives, and lies.',
    sourceType: 'insight',
    pageNumber: 41,
  },
  {
    insightNumber: 16,
    content: 'As thinkers, we experience the hide-and-seek of eternal perfection; choosing either to fall into the darkness of complacency and discouragement, or move through it, by groping the walls of internal perspective, knowing there is a light of new understanding waiting to be discovered.',
    sourceType: 'insight',
    pageNumber: 45,
  },
  {
    insightNumber: 17,
    content: 'Understand, life is a puzzle and you are composed of many pieces, everything surrounding is a clue to help master peace within you.',
    sourceType: 'insight',
    pageNumber: 45,
  },
  {
    insightNumber: 18,
    content: 'Media and news are not resources, they are platforms of opinions.',
    sourceType: 'insight',
    pageNumber: 45,
  },
  {
    insightNumber: 19,
    content: 'Our differences are our greatest teachers.',
    sourceType: 'insight',
    pageNumber: 49,
  },
  {
    insightNumber: 20,
    content: 'In light and in darkness, there you are. Who are you?',
    sourceType: 'insight',
    pageNumber: 49,
  },
  {
    insightNumber: 21,
    content: 'I am nurtured by the liquids that have fallen from my face during my weathering. Now bloomed into a tree of many flowers, I bear fruits and birth seeds that brings divine dreams into reality.',
    sourceType: 'insight',
    pageNumber: 55,
  },
  {
    insightNumber: 22,
    content: 'The nerve of these guys, using our minds as their prize.',
    sourceType: 'insight',
    pageNumber: 55,
  },
  {
    insightNumber: 23,
    content: 'Be mindful not to consume your present with the posts of someone else\'s past.',
    sourceType: 'insight',
    pageNumber: 55,
  },
  {
    insightNumber: 24,
    content: 'As I sought to find answers to questions I didn\'t create, I inherited disharmony I could not shake. The only escape was the moment I chose to replace the door with an open frame. Allowing peace to be accepted by any means, fate to be directed on the basis of my heart\'s dreams and mind to be structured as support to whatever my soul seeds.',
    sourceType: 'insight',
    pageNumber: 62,
  },
  {
    insightNumber: 25,
    content: 'The battle is in conscious attention. It always has been. The only shift is in the narrative and how the truth is spinned.',
    sourceType: 'insight',
    pageNumber: 63,
  },
  {
    insightNumber: 26,
    content: 'Don\'t get caught up in trends, it is then your uniqueness is blending in, what is the point if you live and create nothing from within.',
    sourceType: 'insight',
    pageNumber: 65,
  },
  {
    insightNumber: 27,
    content: 'Creation is the God element. Just as God, do you create. Even by interpreting perspective, so too do you create. There is no escaping your creative ways.',
    sourceType: 'insight',
    pageNumber: 66,
  },
  {
    insightNumber: 28,
    content: 'As we tightrope the edges of potential, a centered heart keeps the balance, belief calibrates the mind, guiding the arrival to the other side of the line.',
    sourceType: 'insight',
    pageNumber: 67,
  },
  {
    insightNumber: 29,
    content: 'Sometimes, you have to overcome the fear of losing joy to allow it to expand.',
    sourceType: 'insight',
    pageNumber: 67,
  },
  {
    insightNumber: 30,
    content: 'Ride the waves of your lifeline, balance on the board of perspectives, find joy in the crashes and inspiration in the wipeouts.',
    sourceType: 'insight',
    pageNumber: 70,
  },
  {
    insightNumber: 31,
    content: 'Seeking, seeking, seeking, until you realize there is nothing to find, only a beingness to explore.',
    sourceType: 'insight',
    pageNumber: 71,
  },
  {
    insightNumber: 32,
    content: 'In the abyss of nothingness is everything.',
    sourceType: 'insight',
    pageNumber: 74,
  },
  {
    insightNumber: 33,
    content: 'Find the state of being in no place and fall into alignment with all that is.',
    sourceType: 'insight',
    pageNumber: 75,
  },
  {
    insightNumber: 34,
    content: 'As the sun keeps its promise I take in its array of presence, showering my room with a golden hue, heaven beams through.',
    sourceType: 'insight',
    pageNumber: 75,
  },
  {
    insightNumber: 35,
    content: 'We will look into the eyes of infinity forever, watch change blend into lines that divide past and present, formations of all that could be created, morphs into waves waiting for a surfer.',
    sourceType: 'insight',
    pageNumber: 78,
  },
  {
    insightNumber: 36,
    content: 'You are a fisherman among the sea of infinite potential, you create only the perception of what you have discovered. Stay Humble.',
    sourceType: 'insight',
    pageNumber: 78,
  },
  {
    insightNumber: 37,
    content: 'Infinite is God. God is the Infinite.',
    sourceType: 'insight',
    pageNumber: 79,
  },
  {
    insightNumber: 38,
    content: 'You are a god, being.',
    sourceType: 'insight',
    pageNumber: 82,
  },
  {
    insightNumber: 39,
    content: 'The PAST was a gift of yesterday, the NOW is a present of today.',
    sourceType: 'insight',
    pageNumber: 82,
  },
  {
    insightNumber: 40,
    content: 'Beyond the limits of the furthest star, extends the boundaries of your soul and heart.',
    sourceType: 'insight',
    pageNumber: 83,
  },
  {
    insightNumber: 41,
    content: 'Tears soaking through layers of generations, seeping into young hearts carrying burdens of bloodlines that lace the mind with memories they have never experienced. The unsolved mysteries of what keeps hatred fresh and pain contagious.',
    sourceType: 'insight',
    pageNumber: 85,
  },
  {
    insightNumber: 42,
    content: 'The truth is, you experience all of it in heaven.',
    sourceType: 'insight',
    pageNumber: 85,
  },
  {
    insightNumber: 43,
    content: 'In the brokenness of pain, I learned to rebuild by projecting prayers for those I\'ve never seen.',
    sourceType: 'insight',
    pageNumber: 88,
  },
  {
    insightNumber: 44,
    content: 'Every star shines brightly, appearing to be at peace and in order from afar. Yet the closer we get to its light, we can be met with orbiting meteorites, shifting lands, and disruptive atmospheres; an uninhabitable space, aside from that which is of itself. Proving once more to never envy another star, for the composition may vary and the conditions that support its luminosity may be beyond what is bearable for the admirer to absorb.',
    sourceType: 'insight',
    pageNumber: 89,
  },
  {
    insightNumber: 45,
    content: 'See with divine eyes. Speak with divine tongue. Hear with divine ears. Feel with divine heart.',
    sourceType: 'insight',
    pageNumber: 89,
  },
  {
    insightNumber: 46,
    content: 'Allow change it\'s the only path that leads to growth.',
    sourceType: 'insight',
    pageNumber: 94,
  },
  {
    insightNumber: 47,
    content: 'Self-confidence is not about glory, it is a mind convinced that the body & its derivatives are products of Divine.',
    sourceType: 'insight',
    pageNumber: 94,
  },
  {
    insightNumber: 48,
    content: 'Turn your expectations into goals and your fears into targets.',
    sourceType: 'insight',
    pageNumber: 95,
  },
  {
    insightNumber: 49,
    content: 'You are perfect enough to exist as is and great enough to exist more.',
    sourceType: 'insight',
    pageNumber: 97,
  },
  {
    insightNumber: 50,
    content: 'Carry on creating, validation is not required.',
    sourceType: 'insight',
    pageNumber: 97,
  },
  {
    insightNumber: 51,
    content: 'Ideally, nothing is impossible, but realistically we exist in the playpen of time. Keep in mind, even nature submits to the laws of creation, and it\'s one step at a time.',
    sourceType: 'insight',
    pageNumber: 100,
  },
  {
    insightNumber: 52,
    content: 'Let it be, not beat you.',
    sourceType: 'insight',
    pageNumber: 101,
  },
  {
    insightNumber: 53,
    content: 'Elevate into the potential of your uniqueness.',
    sourceType: 'insight',
    pageNumber: 101,
  },
  {
    insightNumber: 54,
    content: 'The world needs your greatness stop resting in mediocracy.',
    sourceType: 'insight',
    pageNumber: 102,
  },
  {
    insightNumber: 55,
    content: 'There are those who wish for you to fail because it will make them feel better about losing you. Make them hate it, WIN WIN WIN WIN!',
    sourceType: 'insight',
    pageNumber: 103,
  },
  {
    insightNumber: 56,
    content: 'Don\'t want more, BECOME MORE.',
    sourceType: 'insight',
    pageNumber: 104,
  },
  {
    insightNumber: 57,
    content: 'LIFE IS A PLAYGROUND OF EXPERIENCES. Be as free as a child, keep your heart light & explore the potentials of imagination.',
    sourceType: 'insight',
    pageNumber: 105,
  },
  {
    insightNumber: 58,
    content: 'There will be times when others will have expectations of you and when you don\'t satisfy them in their timing, they detach. This is a gift of freedom, rejoice and be glad in it.',
    sourceType: 'insight',
    pageNumber: 108,
  },
  {
    insightNumber: 59,
    content: 'Let faith POWER the wings of your AMBITION and love be the style of your glide.',
    sourceType: 'insight',
    pageNumber: 109,
  },
  {
    insightNumber: 60,
    content: 'I recall the moments I spent projecting a better future. Often seeing everything that could be improved, instead of acknowledging what was already perfect. I was in pursuit of perfection, instead of existing in the perfection of being.',
    sourceType: 'insight',
    pageNumber: 111,
  },
  {
    insightNumber: 61,
    content: 'To ensure you\'re always ready, STAY PRESENT.',
    sourceType: 'insight',
    pageNumber: 114,
  },
  {
    insightNumber: 62,
    content: 'You are only worthy of being yourself.',
    sourceType: 'insight',
    pageNumber: 114,
  },
  {
    insightNumber: 63,
    content: 'It may appear everyone is doing better than you. Impossible, they\'re not you.',
    sourceType: 'insight',
    pageNumber: 115,
  },
  {
    insightNumber: 64,
    content: 'People will talk about you. Let them. That\'s their story, focus on yours.',
    sourceType: 'insight',
    pageNumber: 115,
  },
  {
    insightNumber: 65,
    content: 'Be grateful for challenges, they are portals of evolution.',
    sourceType: 'insight',
    pageNumber: 118,
  },
  {
    insightNumber: 66,
    content: 'Etching out my lane with boundaries that define a greater me. Regardless if there\'s an audience to see, mode shifted to internal infinite dreams.',
    sourceType: 'insight',
    pageNumber: 118,
  },
  {
    insightNumber: 67,
    content: 'Nothing is for nothing. Even when one appears to not be in pursuit of anything, they\'re moving towards the finding of a new thing.',
    sourceType: 'insight',
    pageNumber: 119,
  },
  {
    insightNumber: 68,
    content: 'Every bloom occurs over a series of changes.',
    sourceType: 'insight',
    pageNumber: 119,
  },
  {
    insightNumber: 69,
    content: 'Limited not by what is seen of me, but by what I believe to be of me.',
    sourceType: 'insight',
    pageNumber: 120,
  },
  {
    insightNumber: 70,
    content: 'Stop being shy about wanting to be extraordinary.',
    sourceType: 'insight',
    pageNumber: 123,
  },
  {
    insightNumber: 71,
    content: 'Was tired of trying to be, so I became, free from everything and expanded beyond my dreams.',
    sourceType: 'insight',
    pageNumber: 124,
  },
  {
    insightNumber: 72,
    content: 'En route to success, failure is a come-up.',
    sourceType: 'insight',
    pageNumber: 124,
  },
  {
    insightNumber: 73,
    content: 'When you retreat to cleanse your mind from attachments and bad friends, there is a purging effect that happens. It can feel as painful as the first days of a fast. The conscious mind seems to ache as it craves the junk that previously fed its addictions and external dependencies. Keep steadfast. Inner peace will make its way to the surface.',
    sourceType: 'insight',
    pageNumber: 125,
  },
  {
    insightNumber: 74,
    content: 'Just before a rocket launches into orbit, it sheds what no longer serves it. As should you.',
    sourceType: 'insight',
    pageNumber: 127,
  },
  {
    insightNumber: 75,
    content: 'AS FOR YOUR DREAMS TO SAVE THE WORLD, bring order to the world within and the external will make amends.',
    sourceType: 'insight',
    pageNumber: 129,
  },
  {
    insightNumber: 76,
    content: 'All that appears to be a struggle, is merely a weight you are lifting to gain strength and identify your weaknesses.',
    sourceType: 'insight',
    pageNumber: 129,
  },
  {
    insightNumber: 77,
    content: 'Before doubt convinces you to quit, do whatever it takes to finish.',
    sourceType: 'insight',
    pageNumber: 133,
  },
  {
    insightNumber: 78,
    content: 'Let it go, like a dandelion seed in the wind, release, into the space of no ends, where all possibilities begin.',
    sourceType: 'insight',
    pageNumber: 133,
  },
  {
    insightNumber: 79,
    content: 'Every night before you sleep, spend time with your mind, and reverse any negatively charged thoughts or ideas about the day that you may have gathered.',
    sourceType: 'insight',
    pageNumber: 136,
  },
  {
    insightNumber: 80,
    content: 'Self-motivation is a necessary skill to build. Otherwise, you could listen to all the motivational audio, read all the self-help books, and have all of your friends rooting you on, but none would penetrate deep enough to make a difference.',
    sourceType: 'insight',
    pageNumber: 136,
  },
  {
    insightNumber: 81,
    content: 'ACTION is the physical form of FAITH.',
    sourceType: 'insight',
    pageNumber: 137,
  },
  {
    insightNumber: 82,
    content: 'Be audacious when turning dreams into matter.',
    sourceType: 'insight',
    pageNumber: 142,
  },
  {
    insightNumber: 83,
    content: 'Life is an external gallery of internal artifacts.',
    sourceType: 'insight',
    pageNumber: 142,
  },
  {
    insightNumber: 84,
    content: 'Thank you for listening dear ears of Divine, taking in prayers I\'ve mentioned within and out loud, showing your presence with no need of a crowd, acknowledging my essence as a blessing endowed.',
    sourceType: 'insight',
    pageNumber: 143,
  },
  {
    insightNumber: 85,
    content: 'Confidence is not about ego. It\'s about believing in the power within & around you, and knowing it\'s always working in your favor.',
    sourceType: 'insight',
    pageNumber: 147,
  },
  {
    insightNumber: 86,
    content: 'The greatest parts of you are revealed when you no longer accept the reduced version to be an option.',
    sourceType: 'insight',
    pageNumber: 147,
  },
  {
    insightNumber: 87,
    content: 'If everyone in society bloomed into their uniqueness, imagine the fragrance of our personalities and the mood of our atmosphere.',
    sourceType: 'insight',
    pageNumber: 148,
  },
  {
    insightNumber: 88,
    content: 'Emotions are energetic investments, find the patterns and monitor your stocks.',
    sourceType: 'insight',
    pageNumber: 149,
  },
  {
    insightNumber: 89,
    content: 'The higher-self is an individualized channel for the infinite source of love. Love is the eternal generator of life. Life represents the expression of infinite beingness. Infinite expression is eternal evolution. It is the medium of possibility and the canvas of discovery.',
    sourceType: 'insight',
    pageNumber: 149,
  },
  {
    insightNumber: 90,
    content: 'Time is eternal, never fear a loss as the last opportunity.',
    sourceType: 'insight',
    pageNumber: 150,
  },
  {
    insightNumber: 91,
    content: 'In honor of your true beauty, accept the curves of your existence.',
    sourceType: 'insight',
    pageNumber: 155,
  },
  {
    insightNumber: 92,
    content: 'Self-mastery is also allowing yourself to be misunderstood.',
    sourceType: 'insight',
    pageNumber: 156,
  },
  {
    insightNumber: 93,
    content: 'There is wisdom in silence.',
    sourceType: 'insight',
    pageNumber: 156,
  },
  {
    insightNumber: 94,
    content: 'Keep your heart rooted in the soil of your intentions and your truth as the petals of your mind.',
    sourceType: 'insight',
    pageNumber: 157,
  },
  {
    insightNumber: 95,
    content: 'The universe never runs out of patience. Forgive yourself.',
    sourceType: 'insight',
    pageNumber: 160,
  },
  {
    insightNumber: 96,
    content: 'You can never be more than what you believe you are.',
    sourceType: 'insight',
    pageNumber: 161,
  },
  {
    insightNumber: 97,
    content: 'Life is not an obstacle course, its a field of discovery.',
    sourceType: 'insight',
    pageNumber: 161,
  },
  {
    insightNumber: 98,
    content: 'Sometimes it\'s hard to be the light. Sometimes, you can only be a spark on the wick of a new perspective.',
    sourceType: 'insight',
    pageNumber: 163,
  },
  {
    insightNumber: 99,
    content: 'True reality exists in the space of the mind\'s eye, on the stream of soul vibes in the heart of the unified.',
    sourceType: 'insight',
    pageNumber: 163,
  },
  {
    insightNumber: 100,
    content: 'There is life in stillness.',
    sourceType: 'insight',
    pageNumber: 165,
  },
  {
    insightNumber: 101,
    content: 'Waves never approach the shore in hesitation hoping to create the perfect wash. Yet, in its uncalculated crashes, the collection of its happenings offers masterpiece after masterpiece after masterpiece. Create. Share. Thrive.',
    sourceType: 'insight',
    pageNumber: 166,
  },
  {
    insightNumber: 102,
    content: 'As we tightrope the edges of potential, a centered heart keeps the balance, belief calibrates the mind, guiding the arrival to the other side of the line.',
    sourceType: 'insight',
    pageNumber: 167,
  },
  {
    insightNumber: 103,
    content: 'Sometimes you have to overcome the fear of losing joy to allow it to expand.',
    sourceType: 'insight',
    pageNumber: 167,
  },
  {
    insightNumber: 104,
    content: 'It\'s all a dance, the orchestration of life. Moving naturally with no specified rhythm. Only in melodies of diversities. Each part its own instrument. Each heart holding its own note. Each soul a harmonic composer of love\'s symphonic flow.',
    sourceType: 'insight',
    pageNumber: 169,
  },
  {
    insightNumber: 105,
    content: 'Discover more ways to love yourself, you\'ll find it easier to adore more of everything else.',
    sourceType: 'insight',
    pageNumber: 172,
  },
  {
    insightNumber: 106,
    content: 'Make it a habit to not complain, it lightens the weight of heavy days.',
    sourceType: 'insight',
    pageNumber: 172,
  },
  {
    insightNumber: 107,
    content: 'Peace is not found, peace is allowed.',
    sourceType: 'insight',
    pageNumber: 173,
  },
  {
    insightNumber: 108,
    content: 'You can choose to be happy you can choose to be sad. Your majesty, your magic stays manifesting your days.',
    sourceType: 'insight',
    pageNumber: 173,
  },
  {
    insightNumber: 109,
    content: 'Individual is in - divine - duality.',
    sourceType: 'insight',
    pageNumber: 179,
  },
  {
    insightNumber: 110,
    content: 'What will you do to contribute to the GREATNESS of our generation?',
    sourceType: 'insight',
    pageNumber: 179,
  },
  {
    insightNumber: 111,
    content: 'Turn the page and keep the pen moving. Life is still in progress. Enjoy.',
    sourceType: 'insight',
    pageNumber: 185,
  },
  {
    insightNumber: 112,
    content: 'When we intentionally participate in making an effort to evolve our understanding and improve our thought patterns, we do more than mechanically evolve, we bloom.',
    sourceType: 'insight',
    pageNumber: 186,
  },
  {
    insightNumber: 113,
    content: 'Accept : Release. Allow : Expand.',
    sourceType: 'insight',
    pageNumber: 186,
  },
  {
    insightNumber: 114,
    content: 'Awareness determines the capacity of wisdom possible for an individual. Open wide.',
    sourceType: 'insight',
    pageNumber: 187,
  },
  {
    insightNumber: 115,
    content: 'Consciousness is Intelligence. Spirit is Mind. Creation is Law. Love is Order.',
    sourceType: 'insight',
    pageNumber: 187,
  },
  {
    insightNumber: 116,
    content: 'If only we would watch the stars of our universe and learn by the examples of their order, shining brightly as an individual without projecting in conflict with the other stars surrounding. Each has its own audience of solar systems, Each its own space to express, Each its own unique frequency to emit.',
    sourceType: 'insight',
    pageNumber: 188,
  },
  {
    insightNumber: 117,
    content: 'We are unique tunes, building one major symphony of humanity. Diversity is necessary for harmony. Racism is spiritual dissonance.',
    sourceType: 'insight',
    pageNumber: 188,
  },
  {
    insightNumber: 118,
    content: 'Mind and Body. Creator and Materialist. Light and Shadows. Eternity and the Infinite Finite.',
    sourceType: 'insight',
    pageNumber: 189,
  },
  {
    insightNumber: 119,
    content: 'Mind is your canvas and your heart holds the hues.',
    sourceType: 'insight',
    pageNumber: 189,
  },
  {
    insightNumber: 120,
    content: 'Excuses keep you where you are, courage introduces you to who you are.',
    sourceType: 'insight',
    pageNumber: 190,
  },
  {
    insightNumber: 121,
    content: 'The universe is on your side, believe it without a doubt.',
    sourceType: 'insight',
    pageNumber: 190,
  },
  {
    insightNumber: 122,
    content: 'Soul ____ (Power, Energy, Inertia). Mind ____ (Observer, Interpreter, Cause). Body ____ (Time keeper, Sensationalist, Manifestation tool).',
    sourceType: 'insight',
    pageNumber: 191,
  },
  {
    insightNumber: 123,
    content: 'If you\'re too afraid to deal with failure, you\'re not yet strong enough to live with success.',
    sourceType: 'insight',
    pageNumber: 191,
  },
  {
    insightNumber: 124,
    content: 'To yourself be kind, it will teach you compassion.',
    sourceType: 'insight',
    pageNumber: 192,
  },
  {
    insightNumber: 125,
    content: 'Here we are, expanding into where forever goes.',
    sourceType: 'insight',
    pageNumber: 192,
  },
  {
    insightNumber: 126,
    content: 'The sky is not the limit, it\'s the beginning.',
    sourceType: 'insight',
    pageNumber: 193,
  },
  {
    insightNumber: 127,
    content: 'Your internal posts matter most.',
    sourceType: 'insight',
    pageNumber: 194,
  },
  {
    insightNumber: 128,
    content: 'You are human, love your hues.',
    sourceType: 'insight',
    pageNumber: 194,
  },
  {
    insightNumber: 129,
    content: 'Learning to trust yourself is beyond having confidence, it honors the divine navigator within.',
    sourceType: 'insight',
    pageNumber: 195,
  },
  {
    insightNumber: 130,
    content: 'Resistance is not always a sign to push harder. Sometimes, it\'s a nudge to reevaluate and find a better approach.',
    sourceType: 'insight',
    pageNumber: 195,
  },
  {
    insightNumber: 131,
    content: 'Your dreams will build a greater reality for the world, please, don\'t give up.',
    sourceType: 'insight',
    pageNumber: 196,
  },
  {
    insightNumber: 132,
    content: 'Are you lost, or hiding?',
    sourceType: 'insight',
    pageNumber: 196,
  },
  {
    insightNumber: 133,
    content: 'During your journey, all things move as perfect imperfections.',
    sourceType: 'insight',
    pageNumber: 197,
  },
  {
    insightNumber: 134,
    content: 'Follow the feeling.',
    sourceType: 'insight',
    pageNumber: 197,
  },
  {
    insightNumber: 135,
    content: 'You are not what they expected. You are way different and beyond. I am not what they expected. I am way different and beyond.',
    sourceType: 'insight',
    pageNumber: 198,
  },
  {
    insightNumber: 136,
    content: 'Brick upon brick we build our lives upon a dream, thought upon thought determine how much comes into being.',
    sourceType: 'insight',
    pageNumber: 199,
  },
  {
    insightNumber: 137,
    content: 'If the past didn\'t work, you deserve a new future, let go and make room.',
    sourceType: 'insight',
    pageNumber: 199,
  },
  {
    insightNumber: 138,
    content: 'In the brokenness of pain, I learned to rebuild by projecting prayers for those I\'ve never seen.',
    sourceType: 'insight',
    pageNumber: 200,
  },
  {
    insightNumber: 139,
    content: 'Creativity is the breath of soul.',
    sourceType: 'insight',
    pageNumber: 201,
  },
  {
    insightNumber: 140,
    content: 'It is only possible if you are willing to take the chance.',
    sourceType: 'insight',
    pageNumber: 201,
  },
  {
    insightNumber: 141,
    content: 'Today do not judge your progress. Today be fully present in your process. You can not manifest what you are not present for.',
    sourceType: 'insight',
    pageNumber: 202,
  },
  {
    insightNumber: 142,
    content: 'You are no more than the love you give.',
    sourceType: 'insight',
    pageNumber: 202,
  },
  {
    insightNumber: 143,
    content: 'Falling into an obsession, realizing life is a blessing, every challenge is an unwrapping of getting mo\' betta, mo\' betta, mo\' betta.',
    sourceType: 'insight',
    pageNumber: 203,
  },

  // SECTION: Compelling Poem Lines
  {
    insightNumber: 144,
    content: 'Why don\'t they just LOVE? for love, is the base of knowledge.',
    sourceType: 'poem-line',
    sourcePoemNumber: 1,
    sourcePoemTitle: 'The Call',
  },
  {
    insightNumber: 145,
    content: 'We are the race that matters, Humankind.',
    sourceType: 'poem-line',
    sourcePoemNumber: 1,
    sourcePoemTitle: 'The Call',
  },
  {
    insightNumber: 146,
    content: 'Somehow, they can\'t see how systematically clouding content flows through the media.',
    sourceType: 'poem-line',
    sourcePoemNumber: 1,
    sourcePoemTitle: 'The Call',
  },
  {
    insightNumber: 147,
    content: 'Stop just hoping. Do something. Wake from the dream state.',
    sourceType: 'poem-line',
    sourcePoemNumber: 1,
    sourcePoemTitle: 'The Call',
  },
  {
    insightNumber: 148,
    content: 'We\'ve been fed infected ingredients, infested with manufactured dreams.',
    sourceType: 'poem-line',
    sourcePoemNumber: 2,
    sourcePoemTitle: 'Thieves of Destiny',
  },
  {
    insightNumber: 149,
    content: 'So for now, let poetry speak.',
    sourceType: 'poem-line',
    sourcePoemNumber: 2,
    sourcePoemTitle: 'Thieves of Destiny',
  },
  {
    insightNumber: 150,
    content: 'Let\'s colorblind ourselves and grab a hand that will help each make it through.',
    sourceType: 'poem-line',
    sourcePoemNumber: 3,
    sourcePoemTitle: 'Limited Fields',
  },
  {
    insightNumber: 151,
    content: 'Don\'t be so complacent with the fantasy of limited fields.',
    sourceType: 'poem-line',
    sourcePoemNumber: 3,
    sourcePoemTitle: 'Limited Fields',
  },
  {
    insightNumber: 152,
    content: 'We are not prisoners of time. We are not subjected to the pain that falls upon the mind.',
    sourceType: 'poem-line',
    sourcePoemNumber: 4,
    sourcePoemTitle: 'Stagnant',
  },
  {
    insightNumber: 153,
    content: 'We are energy experiencing the challenge to transform, from a state we already know.',
    sourceType: 'poem-line',
    sourcePoemNumber: 4,
    sourcePoemTitle: 'Stagnant',
  },
  {
    insightNumber: 154,
    content: 'Grow on. Beyond.',
    sourceType: 'poem-line',
    sourcePoemNumber: 4,
    sourcePoemTitle: 'Stagnant',
  },
  {
    insightNumber: 155,
    content: 'Keep your eye strong. Occupy your mind with love\'s song.',
    sourceType: 'poem-line',
    sourcePoemNumber: 5,
    sourcePoemTitle: 'Like a Rapture',
  },
  {
    insightNumber: 156,
    content: 'Who are we, if we only choose to be the struggles of our ancestors?',
    sourceType: 'poem-line',
    sourcePoemNumber: 6,
    sourcePoemTitle: 'Deprogram',
  },
  {
    insightNumber: 157,
    content: 'Where are we going, if our future is built on the collapsing structures of our past?',
    sourceType: 'poem-line',
    sourcePoemNumber: 6,
    sourcePoemTitle: 'Deprogram',
  },
  {
    insightNumber: 158,
    content: 'There are no borders in the conscious. No culture without diversity.',
    sourceType: 'poem-line',
    sourcePoemNumber: 6,
    sourcePoemTitle: 'Deprogram',
  },
  {
    insightNumber: 159,
    content: 'The only perspective effective, is in relation to the one within.',
    sourceType: 'poem-line',
    sourcePoemNumber: 6,
    sourcePoemTitle: 'Deprogram',
  },
  {
    insightNumber: 160,
    content: 'In silence, Poetry teaches.',
    sourceType: 'poem-line',
    sourcePoemNumber: 7,
    sourcePoemTitle: 'Lucid Language',
  },
  {
    insightNumber: 161,
    content: 'It\'s the break between speaking that reels in what it means to the listener.',
    sourceType: 'poem-line',
    sourcePoemNumber: 7,
    sourcePoemTitle: 'Lucid Language',
  },
  {
    insightNumber: 162,
    content: 'Poetry comes in peace.',
    sourceType: 'poem-line',
    sourcePoemNumber: 7,
    sourcePoemTitle: 'Lucid Language',
  },
  {
    insightNumber: 163,
    content: 'Finding my glory, even if it means I\'ve made it all up.',
    sourceType: 'poem-line',
    sourcePoemNumber: 32,
    sourcePoemTitle: 'Release',
  },
  {
    insightNumber: 164,
    content: 'The land of my mental is all I live on.',
    sourceType: 'poem-line',
    sourcePoemNumber: 32,
    sourcePoemTitle: 'Release',
  },
  {
    insightNumber: 165,
    content: 'I am free.',
    sourceType: 'poem-line',
    sourcePoemNumber: 32,
    sourcePoemTitle: 'Release',
  },
]

async function seedInsights() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing env var: DATABASE_URL')
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()

  try {
    // Insert insights
    for (const insight of INSIGHTS) {
      await client.query(
        `INSERT INTO insights
        (insight_number, content, source_type, source_poem_number, source_poem_title, page_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (insight_number) DO UPDATE 
        SET content = $2, source_type = $3, source_poem_number = $4, source_poem_title = $5, page_number = $6;`,
        [
          insight.insightNumber,
          insight.content,
          insight.sourceType,
          insight.sourcePoemNumber || null,
          insight.sourcePoemTitle || null,
          insight.pageNumber || null,
        ]
      )
    }

    console.log(`✅ Seeded ${INSIGHTS.length} insights into Neon`)
    console.log('📊 Breakdown:')
    console.log(`   - Official insights: 143`)
    console.log(`   - Poem lines: ${INSIGHTS.length - 143}`)
  } catch (error) {
    console.error('❌ Error seeding insights:', error)
    throw error
  } finally {
    await client.end()
  }
}

seedInsights()
  .then(() => {
    console.log('\n✨ Seed complete!')
    process.exit(0)
  })
  .catch(() => process.exit(1))
