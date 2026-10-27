// backend/services/demoService.js
const fs = require("fs");
const path = require("path");

// ================================================================
// 🎭 DEMO MODE — files served from /public/demo
// ================================================================
const DEMO_PUBLIC_ROOT = path.join(__dirname, "../public/demo");
const DEMO_PDF_ROOT = path.join(DEMO_PUBLIC_ROOT, "pdf");
const DEMO_IMG_ROOT = path.join(DEMO_PUBLIC_ROOT, "images");

// Public URL prefix (served by express.static("/public"))
const DEMO_PUBLIC_URL = "/demo";

function isDemoMode() {
  return String(process.env.DEMO_MODE || "").toLowerCase() === "true";
}

// ================================================================
// 📄 DEMO PDF MAP — kind → filename
// ================================================================
const DEMO_PDF_FILES = {
  story: "Mystery_Story.pdf",
  suspects: "Suspect_Cards.pdf",
  clues: "Clues_and_Evidence.pdf",
  puzzles: "Puzzle_Sheets.pdf",
  solution: "Solution_Guide.pdf",
  instructions: "Player_Instructions.pdf",
};

// ================================================================
// 🎭 DEMO MYSTERY DATA — no DB needed
// Image URLs point to /demo/images/... (public folder)
// ================================================================
function buildDemoMystery(publicUrl = "/demo") {
  if (typeof publicUrl !== "string")
    throw new TypeError("publicUrl must be a string");
  const base = publicUrl.replace(/\/+$/, "");

  const data = {
    _id: "demo-ashcombe-001",
    userId: "demo-user",
    title: "The Last Bell of Ashcombe House",
    genre: "Murder Mystery",
    setting: "English country manor, 17 October 1934",
    difficulty: "Medium",
    playerCount: "1-6",
    duration: 120,
    targetAudience: "Ages 14+",
    storyIdea:
      "An independent researcher attends an announcement at a storm-bound country house. Before the owner can expose unauthorized sales from his collection, he is found dead beside a brass handbell. Six suspects, a torn cuff and a locked dispatch box reveal a trail of false authority.",
    generationStatus: "completed",
    generationProgress: 100,
    currentStage: "Completed",
    createdAt: "2026-10-27T00:00:00.000Z",
    updatedAt: "2026-10-27T00:00:00.000Z",

    /* ══════════════════════════════════════════════════════════════
       STORY
       ══════════════════════════════════════════════════════════════ */
    story: {
      introduction:
        "The invitation arrived on heavy cream paper, its edges still carrying the faint smell of the cedar drawer in which it had been kept. Edmund Ashcombe requested your presence at his country house on Wednesday, 17 October 1934. There would be supper at eight, a private exhibition of the family collection, and an announcement at half past nine.\n\nAt the bottom, beneath the formal signature, he had added a sentence in a less steady hand: 'I would value a witness who has no interest in the outcome.' You knew him only through a small commission to catalogue local historical records. The request was unusual enough to accept.\n\nAshcombe House stood beyond a flooded lane, its long windows shining through the rain. In the entrance hall, a brass handbell rested on a side table. Its handle was shaped like a swallow, and its base carried a crescent-shaped chip. Martha Reed, the housekeeper, moved it away from the edge as she took your coat.\n\n'Mr Ashcombe uses it when the electric call system fails,' she said. 'Which, in this weather, it usually does.' Somewhere upstairs a door closed. A woman laughed once, sharply, and then the house returned to the sound of rain.\n\nEdmund introduced the guests with the careful courtesy of a man arranging objects in a display case. His niece Nora wore an emerald dress and kept turning a pearl earring between finger and thumb. Dr Felix Mercer spoke warmly, although his attention repeatedly wandered towards his host.\n\nGideon Pike, a dealer in manuscripts and decorative arts, greeted the house as if he might one day sell it. Arthur Bell, the groundskeeper, had been invited inside because the flooded bridge had trapped him on the estate. He sat at the end of the table, uncomfortable in a borrowed tie.\n\nCelia Ward, the family archivist, arrived last from the west wing. Her plum jacket had pale violet cuffs, each edged with a distinctive double row of stitching. You noticed the right cuff when she steadied a wineglass. It had a little triangular repair near the seam.\n\nMartha supervised supper rather than joining it. Edmund insisted that she stay within hearing for the announcement. 'It concerns the house,' he told her. 'Everyone who has kept it alive should hear it.'\n\nNobody asked what he meant. That was the first thing about the evening that seemed rehearsed: six people, each waiting for someone else to speak.",

      background:
        "The collection occupied three rooms: a portrait gallery, a map room, and the library. Edmund showed you a seventeenth-century atlas under glass, a little silver compass, and a cabinet of letters written by people whose names had outlived their fortunes.\n\n'The difficulty with an inheritance,' he said, 'is deciding whether you own it, or merely hold it for the next person.' Gideon smiled politely. Nora did not.\n\nIn the map room you saw a small framed photograph of an astronomical drawing. Celia explained that the original had gone away for conservation. Her answer was quick and exact; she named a workshop in York without pausing.\n\nEdmund touched the edge of the frame. 'Yes,' he said. 'Conservation.' He let the word hang there until Celia turned towards another cabinet.\n\nOn a nearby table lay a printed exhibition list. Several descriptions used the same peculiar capital R: one leg sat noticeably higher than the other. Celia's office typewriter stood in the adjoining archive. A luggage label tied to its case read 'SERVICE REQUIRED', though it looked well used.\n\nThese were ordinary details in an old house. Only afterwards would you begin separating what merely belonged to the room from what someone had carefully arranged for you to see.\n\nEdmund took you into the library and asked whether you could remain until the announcement. On his desk lay a blue document folio sealed with wax, a small dispatch box, and an empty envelope addressed to his solicitor.\n\n'I have checked one account against another,' he said. 'That is often enough. People expect you to examine the impressive document and overlook the ordinary receipt.' He slid the envelope beneath a blotter before you could read more.\n\nYou asked whether he expected trouble. He looked at the library door, then towards the narrower service door beside the bookshelves. Both opened normally. Neither had a special lock or a hidden passage beyond it.\n\n'I expect explanations,' he replied. 'There is a difference.'\n\nBefore you left, Edmund asked Martha to bring the swallow-handled bell from the hall. The electrical call button had failed again. Martha set the bell on the desk at 9:08, beside the blue folio, while you watched from the doorway.\n\nThe scene would later be remembered as an arrangement of important objects. At the time it was only a man preparing to do difficult business in private, with a bell to summon help if the house became too quiet.",

      settingDescription:
        "Ashcombe House is an English country manor isolated by rain and a flooded lane. Its collection occupies the portrait gallery, map room and library. A normal unlocked service door links the library to a passage that bends by the pantry before reaching the archive and kitchen. The east stair leads to the upstairs linen room. The electrical call button is unreliable, so Edmund has a brass handbell on his desk. No secret passage, altered clock or supernatural mechanism exists in this case.",

      mainIncident:
        "At 9:14, a bell sounded from the direction of the library. One clear note travelled into the gallery and was cut short by a heavier noise. You looked up from the exhibition list.\n\nGideon stood beside the open map-room door. 'Dropped something,' he said. He did not move towards the library. Neither did you. Edmund had asked for privacy, and a bell in a house full of servants did not yet suggest an emergency.\n\nNear the far end of the service corridor, Arthur heard the same note while carrying a bucket from the kitchen. He also heard the service door strike its frame a moment later. He saw nobody emerge. The bend in the passage hid the library doorway from where he stood.\n\nAt the telephone alcove, Felix heard little beyond the operator repeating his number. Upstairs, Nora and Martha were lifting the linen box together. They would remember the noise only after being asked about it.\n\nYou looked at the gallery clock because the interruption had broken your conversation. Its minute hand stood on fourteen. It was not a stopped clock, not a clock secretly altered. The evening's most important sound had occurred in plain time, in a house where almost nobody thought to answer it.\n\nAt half past nine, everyone drifted towards the gallery. Gideon straightened his tie. Nora had dust on one shoulder from the linen box. Arthur stood near the staircase, reluctant to tread further onto the carpet.\n\nEdmund did not appear. Martha waited two minutes, then knocked on the library door. There was no answer. She opened it, said his name, and stopped.\n\nHe lay beside the desk, beyond the pool of light from the reading lamp. The handbell rested on the carpet nearby. Its swallow handle pointed towards the service door. The blue folio was still on the desk, but its wax seal had been broken.\n\nFelix went forward, then asked everyone else to remain back. After a short examination he said Edmund was dead and that the injury was consistent with a heavy blow. He would not pretend to identify the exact minute of death from what he could see.\n\nMartha called the village constable. The line worked long enough to carry the message before failing again. Floodwater had made the lane unsafe; help would come as soon as the bridge could be crossed.\n\nUntil then, six people waited beneath the gallery clock, while the seventh would never make the announcement for which they had all assembled.",

      crimeDiscovery:
        "You asked everyone to step away from the library entrance. Nobody was to touch the bell, the desk or Edmund's clothing. Martha brought clean paper so you could make a record of what was visible without moving anything.\n\nThe main door and service door were both unlocked. The windows were fastened from inside, but this was not a room that required an intruder to climb through a window. Anyone already in the house could have entered by either door.\n\nA scrap of pale violet cloth was caught in Edmund's left hand. From the doorway you could see part of a double line of stitching. You recorded it and covered the hand loosely with clean paper, leaving the fragment where it lay for the constable.\n\nOn the carpet, the bell's chipped base had a dark mark along one edge. It was an observation, not a laboratory result. No one in the house was equipped to test it. Felix said the bell should be preserved as a possible weapon.\n\nThe dispatch box was still locked. A small handwritten slip beside it read: 'The house, the order, the hour. Three answers, one lock.' Edmund had always preferred a puzzle to a label. Tonight that habit had become another obstacle between you and the truth.",

      investigationOpening:
        "Nora admitted that the letter in her bag was from a creditor. She had borrowed money to keep a small theatre company alive. Edmund had refused her first request for help, and she feared he would refuse again.\n\n'He thought I was buying applause,' she said. 'I was paying wages.' Her anger seemed old and tired rather than theatrical.\n\nShe had followed Martha upstairs at 9:12. They carried the linen box together, set it outside the damaged room, and inspected the leak. Martha remembered Nora holding the lamp continuously while she climbed a short ladder. They returned downstairs at 9:18.\n\nThe account did not make Nora honest about everything. It did place her with another person during the bell at 9:14. A reason to want money was not the same as an opportunity to commit murder.\n\nNora told you that Edmund had recently spoken of opening the collection to local scholars. She had taken this to mean the house would be sold. 'Perhaps I heard what frightened me most,' she said.\n\nYou asked to preserve the debt letter with the other records. She handed it over immediately. For the first time that evening, someone offered a secret without first asking what you already knew.",

      suspensefulDevelopments: [
        "Celia borrows the library cupboard key at 9:10 and returns it at 9:22. The register does not prove when she left the library.",
        "A single bell note, a thud and the service door are heard at 9:14. Gideon is seen in the gallery at that moment.",
        "Plate G-17 shows Celia's cuff intact at 9:05. At 9:20 the investigator sees a triangular section missing.",
        "Nora's debt explains her anxiety, but Martha places her upstairs from 9:12 to 9:18.",
        "The purported restoration account is actually C. Ward's private commission account.",
        "The York workshop never received the astronomical drawing, contradicting Celia's conservation story.",
        "The cloth fragment in Edmund's hand physically fits Celia's missing cuff section.",
        "The sealed dispatch box preserves a carbon audit and the planned private confrontation, despite removal of the visible sheet from the blue folio.",
      ],

      finalChallenge:
        "Before accusing anyone, you made three columns in your notebook: motive, opportunity and physical connection. Each suspect belonged in at least one column. Only a supported account joining all three would justify a conclusion.\n\nYou placed Nora's debt beside Martha's corroborated upstairs interval. You placed Felix's professional quarrel beside the gaps in the telephone evidence. You placed Gideon's questionable purchases beside your own sight of him in the gallery when the bell rang.\n\nArthur's coal theft explained his fear, but not the cloth. Martha's omission protected Nora, but her revised account could be tested. Celia's explanations required the photograph to be misleading, the payment to be innocent, and an unwitnessed return to the archive to be accepted as fact.\n\nThose were questions, not yet a verdict. You needed the contents of the dispatch box, a proper comparison of the fragment, and a reconstruction that did not invent actions nobody had reason to perform.\n\nOutside, someone shouted from the drive. The constable and a second man had crossed the shallowest part of the lane on foot. Martha went to let them in.\n\nYou closed your notebook. Soon someone would ask for an answer. The difference between suspicion and an accusation would lie in how carefully you could explain the path from one to the other.\n\nThe constable took charge of the library, recorded the position of the bell and preserved the cloth fragment. He asked you to remain available, along with everyone who had heard the sound at 9:14.\n\nYou handed him your notes in time order. Where you had witnessed something yourself, you said so. Where you relied on another person's account, you named them. Where a time was approximate, you left it approximate.\n\nThe house no longer seemed theatrical. A frightened niece sat beside a housekeeper who had tried to protect her. A doctor waited to defend his judgement. A dealer rehearsed explanations that would not improve with repetition. A groundskeeper held his borrowed tie between both hands. An archivist watched the papers.\n\nEdmund's dispatch box stood in the centre of the gallery table. The combination tasks lay beside it, ready to be solved. His final record would not replace the other evidence; it would have to be read against it.\n\nThe gallery clock moved towards ten. You thought of the invitation's final sentence: a witness with no interest in the outcome. That had never meant a witness without responsibility.\n\nNow decide what the evidence supports. Open the appropriate packets, test the contradictions, and write your accusation before consulting the separate Solution Guide. The last bell of Ashcombe House has sounded. The next words belong to you.",

      chapters: [
        {
          id: "CH01",
          chapterNumber: 1,
          title: "The Invitation",
          body: "The invitation arrived on heavy cream paper, its edges still carrying the faint smell of the cedar drawer in which it had been kept. Edmund Ashcombe requested your presence at his country house on Wednesday, 17 October 1934. There would be supper at eight, a private exhibition of the family collection, and an announcement at half past nine.\n\nAt the bottom, beneath the formal signature, he had added a sentence in a less steady hand: 'I would value a witness who has no interest in the outcome.' You knew him only through a small commission to catalogue local historical records. The request was unusual enough to accept.\n\nAshcombe House stood beyond a flooded lane, its long windows shining through the rain. In the entrance hall, a brass handbell rested on a side table. Its handle was shaped like a swallow, and its base carried a crescent-shaped chip. Martha Reed, the housekeeper, moved it away from the edge as she took your coat.\n\n'Mr Ashcombe uses it when the electric call system fails,' she said. 'Which, in this weather, it usually does.' Somewhere upstairs a door closed. A woman laughed once, sharply, and then the house returned to the sound of rain.",
        },
        {
          id: "CH02",
          chapterNumber: 2,
          title: "Six Places at Supper",
          body: "Edmund introduced the guests with the careful courtesy of a man arranging objects in a display case. His niece Nora wore an emerald dress and kept turning a pearl earring between finger and thumb. Dr Felix Mercer spoke warmly, although his attention repeatedly wandered towards his host.\n\nGideon Pike, a dealer in manuscripts and decorative arts, greeted the house as if he might one day sell it. Arthur Bell, the groundskeeper, had been invited inside because the flooded bridge had trapped him on the estate. He sat at the end of the table, uncomfortable in a borrowed tie.\n\nCelia Ward, the family archivist, arrived last from the west wing. Her plum jacket had pale violet cuffs, each edged with a distinctive double row of stitching. You noticed the right cuff when she steadied a wineglass. It had a little triangular repair near the seam.\n\nMartha supervised supper rather than joining it. Edmund insisted that she stay within hearing for the announcement. 'It concerns the house,' he told her. 'Everyone who has kept it alive should hear it.'\n\nNobody asked what he meant. That was the first thing about the evening that seemed rehearsed: six people, each waiting for someone else to speak.",
        },
        {
          id: "CH03",
          chapterNumber: 3,
          title: "A House of Borrowed Things",
          body: "The collection occupied three rooms: a portrait gallery, a map room, and the library. Edmund showed you a seventeenth-century atlas under glass, a little silver compass, and a cabinet of letters written by people whose names had outlived their fortunes.\n\n'The difficulty with an inheritance,' he said, 'is deciding whether you own it, or merely hold it for the next person.' Gideon smiled politely. Nora did not.\n\nIn the map room you saw a small framed photograph of an astronomical drawing. Celia explained that the original had gone away for conservation. Her answer was quick and exact; she named a workshop in York without pausing.\n\nEdmund touched the edge of the frame. 'Yes,' he said. 'Conservation.' He let the word hang there until Celia turned towards another cabinet.\n\nOn a nearby table lay a printed exhibition list. Several descriptions used the same peculiar capital R: one leg sat noticeably higher than the other. Celia's office typewriter stood in the adjoining archive. A luggage label tied to its case read 'SERVICE REQUIRED', though it looked well used.\n\nThese were ordinary details in an old house. Only afterwards would you begin separating what merely belonged to the room from what someone had carefully arranged for you to see.",
        },
        {
          id: "CH04",
          chapterNumber: 4,
          title: "The Photograph",
          body: "At five minutes past nine, Nora gathered everyone beneath the gallery clock for a photograph. She wanted a record, she said, before the family lost any more furniture. Edmund allowed the remark to pass.\n\nThe camera belonged to the house: a compact plate camera on a tripod, prepared earlier by Arthur. He operated the shutter and then set the holder aside for later development. The view included Nora, Edmund, Celia and Gideon; Felix had stepped to the telephone alcove. Martha appeared at the edge carrying an empty tray.\n\nYou stood beside Arthur and watched the flash brighten the pale cuffs of Celia's jacket. The right one lay flat and complete. Its triangular repair was clearly visible when she lifted her hand to shade her eyes after the exposure.\n\nThe time mattered because Nora asked you to read the gallery clock before Arthur reset it for a second attempt. 'Nine-oh-five,' you said. The second photograph was never taken.\n\nEdmund beckoned Celia aside. You heard only the end of their conversation: 'Bring the folio. The blue one. We shall settle the dates before the others come in.' Celia nodded. Her face looked composed, but she had stopped looking at the camera.",
        },
        {
          id: "CH05",
          chapterNumber: 5,
          title: "The Blue Folio",
          body: "Edmund took you into the library and asked whether you could remain until the announcement. On his desk lay a blue document folio sealed with wax, a small dispatch box, and an empty envelope addressed to his solicitor.\n\n'I have checked one account against another,' he said. 'That is often enough. People expect you to examine the impressive document and overlook the ordinary receipt.' He slid the envelope beneath a blotter before you could read more.\n\nYou asked whether he expected trouble. He looked at the library door, then towards the narrower service door beside the bookshelves. Both opened normally. Neither had a special lock or a hidden passage beyond it.\n\n'I expect explanations,' he replied. 'There is a difference.'\n\nBefore you left, Edmund asked Martha to bring the swallow-handled bell from the hall. The electrical call button had failed again. Martha set the bell on the desk at 9:08, beside the blue folio, while you watched from the doorway.\n\nThe scene would later be remembered as an arrangement of important objects. At the time it was only a man preparing to do difficult business in private, with a bell to summon help if the house became too quiet.",
        },
        {
          id: "CH06",
          chapterNumber: 6,
          title: "The Key Book",
          body: "The archive key hung behind Martha's pantry door. It opened the locked document cupboard in the library, not the library itself. Martha kept a ruled book beside it: anyone taking the key was expected to write their name and the time.\n\nAt 9:10, while you returned a borrowed umbrella to the hall, Celia came through the pantry passage. She wrote in the book and took the key. Arthur, who was drying his boots nearby, asked whether she needed a lamp.\n\n'Only the inventory folder,' she said. 'I shall be back in the archive almost at once.'\n\nMartha had gone to the kitchen. The cook needed help with a leaking window, and the corridor smelled of wet plaster. Arthur followed her with a bucket. You returned to the gallery to speak with Nora about the photograph.\n\nLater, people would treat the entry in the book as if it were a record of Celia entering and leaving the library. It was not. It recorded the borrowing of a key, and nothing more. No one saw her return it until 9:22.\n\nThat distinction was small enough to disappear inside a confident statement. It was also the first distinction your investigation would need to recover.",
        },
        {
          id: "CH07",
          chapterNumber: 7,
          title: "A Letter in the Corridor",
          body: "Nora asked whether Edmund had mentioned her. When you said no, she looked relieved and disappointed at once. A folded letter protruded from her evening bag. She pushed it deeper inside before explaining that she had been trying to persuade her uncle to help a friend.\n\nGideon crossed the gallery carrying a catalogue. He paused beside Nora and said, 'Some difficulties are temporary. Your uncle knows that.' She replied that he knew a great many things and understood very few of them.\n\nAt 9:12, Martha appeared in the doorway and asked Nora to help move a small box of family linen away from the leaking roof above the linen room. Nora went with her. You saw the two women disappear up the east stair.\n\nFelix returned from the telephone alcove, annoyed that the storm had interrupted a call. The operator had connected him at 9:09. He said he would try again and went back along the hall.\n\nThere was still no sense of danger. The house was busy with minor emergencies: rain in a cupboard, a broken call button, a conversation postponed. Each small inconvenience gave someone a reason to be elsewhere.",
        },
        {
          id: "CH08",
          chapterNumber: 8,
          title: "A Single Bell",
          body: "At 9:14, a bell sounded from the direction of the library. One clear note travelled into the gallery and was cut short by a heavier noise. You looked up from the exhibition list.\n\nGideon stood beside the open map-room door. 'Dropped something,' he said. He did not move towards the library. Neither did you. Edmund had asked for privacy, and a bell in a house full of servants did not yet suggest an emergency.\n\nNear the far end of the service corridor, Arthur heard the same note while carrying a bucket from the kitchen. He also heard the service door strike its frame a moment later. He saw nobody emerge. The bend in the passage hid the library doorway from where he stood.\n\nAt the telephone alcove, Felix heard little beyond the operator repeating his number. Upstairs, Nora and Martha were lifting the linen box together. They would remember the noise only after being asked about it.\n\nYou looked at the gallery clock because the interruption had broken your conversation. Its minute hand stood on fourteen. It was not a stopped clock, not a clock secretly altered. The evening's most important sound had occurred in plain time, in a house where almost nobody thought to answer it.",
        },
        {
          id: "CH09",
          chapterNumber: 9,
          title: "The Second Sight of Celia",
          body: "At 9:20, you passed the archive doorway on your way to the lavatory. Celia sat at her desk, sorting index cards beneath a green-shaded lamp. She looked up and asked whether Edmund had begun his announcement.\n\n'Not yet,' you said. 'It is only twenty past.'\n\nShe drew her right hand beneath the desk. Before she did, you noticed a jagged gap in the lower edge of the pale cuff. A narrow triangular section was missing beside the old repair. You assumed she had caught it on a cabinet handle.\n\nThe office smelled faintly of hot metal from the lamp and damp wool from her jacket. An open drawer held blue sealing wax, spare ribbon and folders. These were the tools of her work, and none of them was suspicious by itself.\n\nShe said she had been there since ten past nine. Her tone made it sound like an idle fact, offered only to explain why she had lost track of the evening.\n\nAt 9:22, Martha saw her return the archive key. Celia entered the time in the book. The neat interval on the page would later appear to support a tidy errand. You had already seen the one detail that did not fit neatly inside it.",
        },
        {
          id: "CH10",
          chapterNumber: 10,
          title: "The Announcement That Did Not Come",
          body: "At half past nine, everyone drifted towards the gallery. Gideon straightened his tie. Nora had dust on one shoulder from the linen box. Arthur stood near the staircase, reluctant to tread further onto the carpet.\n\nEdmund did not appear. Martha waited two minutes, then knocked on the library door. There was no answer. She opened it, said his name, and stopped.\n\nHe lay beside the desk, beyond the pool of light from the reading lamp. The handbell rested on the carpet nearby. Its swallow handle pointed towards the service door. The blue folio was still on the desk, but its wax seal had been broken.\n\nFelix went forward, then asked everyone else to remain back. After a short examination he said Edmund was dead and that the injury was consistent with a heavy blow. He would not pretend to identify the exact minute of death from what he could see.\n\nMartha called the village constable. The line worked long enough to carry the message before failing again. Floodwater had made the lane unsafe; help would come as soon as the bridge could be crossed.\n\nUntil then, six people waited beneath the gallery clock, while the seventh would never make the announcement for which they had all assembled.",
        },
        {
          id: "CH11",
          chapterNumber: 11,
          title: "Keeping the Room",
          body: "You asked everyone to step away from the library entrance. Nobody was to touch the bell, the desk or Edmund's clothing. Martha brought clean paper so you could make a record of what was visible without moving anything.\n\nThe main door and service door were both unlocked. The windows were fastened from inside, but this was not a room that required an intruder to climb through a window. Anyone already in the house could have entered by either door.\n\nA scrap of pale violet cloth was caught in Edmund's left hand. From the doorway you could see part of a double line of stitching. You recorded it and covered the hand loosely with clean paper, leaving the fragment where it lay for the constable.\n\nOn the carpet, the bell's chipped base had a dark mark along one edge. It was an observation, not a laboratory result. No one in the house was equipped to test it. Felix said the bell should be preserved as a possible weapon.\n\nThe dispatch box was still locked. A small handwritten slip beside it read: 'The house, the order, the hour. Three answers, one lock.' Edmund had always preferred a puzzle to a label. Tonight that habit had become another obstacle between you and the truth.",
        },
        {
          id: "CH12",
          chapterNumber: 12,
          title: "The Niece's Debt",
          body: "Nora admitted that the letter in her bag was from a creditor. She had borrowed money to keep a small theatre company alive. Edmund had refused her first request for help, and she feared he would refuse again.\n\n'He thought I was buying applause,' she said. 'I was paying wages.' Her anger seemed old and tired rather than theatrical.\n\nShe had followed Martha upstairs at 9:12. They carried the linen box together, set it outside the damaged room, and inspected the leak. Martha remembered Nora holding the lamp continuously while she climbed a short ladder. They returned downstairs at 9:18.\n\nThe account did not make Nora honest about everything. It did place her with another person during the bell at 9:14. A reason to want money was not the same as an opportunity to commit murder.\n\nNora told you that Edmund had recently spoken of opening the collection to local scholars. She had taken this to mean the house would be sold. 'Perhaps I heard what frightened me most,' she said.\n\nYou asked to preserve the debt letter with the other records. She handed it over immediately. For the first time that evening, someone offered a secret without first asking what you already knew.",
        },
        {
          id: "CH13",
          chapterNumber: 13,
          title: "A Doctor at the Telephone",
          body: "Felix was offended by the suggestion that his movements needed checking. He became less offended when you explained that everyone's movements did.\n\nHe had treated Edmund for years. Recently they had disagreed over a letter Felix had written endorsing a dubious charitable clinic. Edmund believed the endorsement careless and intended to withdraw his own support. Felix feared professional embarrassment, not merely the loss of a patient.\n\nThe telephone operator could not be reached again, but the household call pad recorded the first connection at 9:09. Martha had written it down before the kitchen leak distracted her. Gideon said he had seen Felix in the alcove at 9:13 and again at 9:16, still arguing with the line.\n\nThat did not create an unbroken alibi. The alcove was a short walk from the library. You marked the gaps rather than filling them with assumptions.\n\nFelix had a smooth white shirt beneath his charcoal jacket. There was no pale violet cuff or visible tear. You made no attempt to turn that observation into a general proof of innocence.\n\n'People will prefer a doctor as the villain,' he said. 'It saves them having to understand the rest.' You replied that the rest was precisely what you intended to understand.",
        },
        {
          id: "CH14",
          chapterNumber: 14,
          title: "The Dealer's Catalogue",
          body: "Gideon gave you the printed exhibition list and said he had spent the crucial minutes in the gallery and map room. You could confirm part of that account yourself: he had been close enough to comment when the bell sounded.\n\nHe admitted negotiating the sale of two drawings from the collection. He believed Edmund had authorized Celia to arrange them. She had supplied letters of authority and provenance notes; Gideon had paid the proceeds into an account she described as the estate's restoration fund.\n\nWhen you asked whether he had ever spoken to Edmund about the sales, he hesitated. 'An agent is supposed to save the principal's time.'\n\nThe catalogue in his hand contained reproductions of the drawings. One description called a replacement photograph an original wash study. Celia had typed the accompanying notes. Gideon pointed to the raised leg on the capital R as if a machine's defect could absolve the person who accepted its words.\n\nHe had motive to avoid a scandal. He had also left a paper trail that could be checked. Those facts could coexist.\n\nYou kept the catalogue. On its final page, beside the entry for the astronomical drawing, Edmund had pencilled a question: 'If the original is in York, why has London already sold it?'",
        },
        {
          id: "CH15",
          chapterNumber: 15,
          title: "The Housekeeper's Omission",
          body: "Martha had worked at Ashcombe House for twenty-nine years. She knew which stair creaked, which guest disliked cloves, and which family quarrels would survive the death of the people who began them.\n\nShe first said she had been in the kitchen throughout the early part of the evening. When you mentioned the linen box, she corrected herself. She had wanted to keep Nora's distress out of the account.\n\n'She was crying upstairs,' Martha said. 'Not for long. She asked me whether he could really leave the house away from her.'\n\nMartha confirmed the interval from 9:12 to 9:18. She also confirmed that she had carried the handbell to Edmund at 9:08 and seen Celia return the key at 9:22. She had not watched the pantry continuously in between.\n\nEdmund had told her the house would become a trust, with employment protected for the resident staff. She had no reason to confuse that plan with an immediate sale. Nora, apparently, had not been given the same explanation.\n\nYou wrote down Martha's first omission as well as her correction. A witness could be protective and still be useful. The task was to find what each statement actually supported, rather than demand that every person be either wholly reliable or wholly false.",
        },
        {
          id: "CH16",
          chapterNumber: 16,
          title: "The Groundskeeper's Boots",
          body: "Arthur had feared the questions since the library door opened. He looked at his muddy boots whenever someone mentioned the service corridor.\n\nAt last he admitted taking coal from the estate store for his sister's cottage. Edmund had discovered the shortage. Arthur expected dismissal and had spent supper trying to judge whether the invitation was kindness or a warning.\n\nHe had helped the cook and Martha with the leak, then carried a bucket along the service corridor. He heard the bell at 9:14 and the service door close shortly afterwards. He saw no face, no coat, no fleeing figure. When pressed, he repeated the limits of his account.\n\n'If I say I saw someone, you will ask me who. I didn't.'\n\nAt 9:17 he reached the kitchen. The cook remembered because she sent him back for a second bucket. His movements left gaps, but his fear explained why he had tried to shorten his story.\n\nOn the floor beside the library service door you found water, not a distinctive trail. Half the household had walked through wet passages. You refused to promote an ordinary muddy mark into a unique signature.\n\nArthur looked relieved when you said so. It was not an acquittal. It was simply one less story built on something the floor could not tell you.",
        },
        {
          id: "CH17",
          chapterNumber: 17,
          title: "The Archivist's Account",
          body: "Celia offered the clearest account of all. At 9:10 she borrowed the cupboard key. She delivered the inventory folio, left Edmund alive, and returned directly to the archive. She remained there until you passed at 9:20, then returned the key at 9:22.\n\nYou asked whether anyone had seen her leave the library. She said no. You asked how long the delivery had taken. 'Less than a minute.'\n\nThe right cuff of her jacket now had an irregular gap beside its triangular repair. She said it had caught on a drawer that afternoon. That answer conflicted with what you remembered from the photograph at 9:05.\n\nYou did not show your notes. Instead, you asked about the drawings. She spoke of conservation, temporary substitutions and instructions given verbally. When you mentioned Gideon's restoration account, she said accounts were outside her duties.\n\nBut the documents Gideon produced bore her covering letters. The office typewriter, she explained, was shared by anyone who needed it. That was true enough: a machine's unusual R identified a machine, not automatically its operator.\n\nFor the first time, the clarity of her statement seemed less reassuring. Every uncertainty had been placed just outside the reach of a witness, while every reassuring detail had been offered with a precise time.",
        },
        {
          id: "CH18",
          chapterNumber: 18,
          title: "The Room Above the Rain",
          body: "Martha gave you permission to examine the archive's public work area while Celia remained in the gallery with the others. You made an inventory before moving any papers and kept the sequence of folders intact.\n\nThe typewriter carried a sheet of exhibition labels. Its capital R matched the raised leg in the provenance notes. That linked the documents to a common machine. It did not settle who had typed them.\n\nInside an open correspondence tray lay a reply from the York conservation workshop. The workshop had declined an enquiry about the astronomical drawing six weeks earlier. It had never received the original. The date contradicted Celia's explanation in the map room.\n\nYou also found a carbon-copy remittance advice addressed to 'C. Ward, private commission account'. The amount matched the seller's payment in Gideon's sales statement. The phrase 'restoration fund' did not appear anywhere on it.\n\nThese were stronger facts than the typewriter defect. A false explanation, an account in a named person's control, and a sale represented as an authorized estate transaction formed a pattern that could be investigated.\n\nYou placed the records in separate sleeves. Outside, rain struck the high archive window with the hard, repeated sound of someone asking to be let in.",
        },
        {
          id: "CH19",
          chapterNumber: 19,
          title: "What the Photograph Could Say",
          body: "Arthur developed the gallery plate in the small darkroom used for cataloguing objects. You stayed with him and recorded the plate holder's label, G-17, so there would be no confusion about which exposure you were examining.\n\nThe image was imperfect at the edges, but Celia's right cuff was sharp. The pale fabric was complete at 9:05. Its triangular repair and double stitching were visible above her wrist.\n\nYou compared that image with a sketch of the cuff as it appeared at 9:20. A triangular piece was now missing beside the repair. The visible fragment in Edmund's hand appeared to have the same colour and two lines of stitching. A careful physical comparison would be needed when the constable arrived.\n\nThe photograph could not name a murderer. It could disprove a specific claim: the cuff had not been torn that afternoon. The damage had occurred sometime between 9:05 and 9:20.\n\nThat interval included Celia's errand to the library, the bell at 9:14 and the stretch of time during which her only alibi was her own statement.\n\nYou wrote the conclusion in exactly those terms. Evidence was most useful when it was allowed to say enough, without being forced to say everything.",
        },
        {
          id: "CH20",
          chapterNumber: 20,
          title: "The House, the Order, the Hour",
          body: "The dispatch box carried a three-wheel combination lock. Edmund's slip offered three answers: the house, the order, the hour. Beneath the words he had drawn a tiny open book.\n\nMartha found the estate visitor booklet in the hall. Edmund had written a short verse on its last page, then marked a note about arranging four archive labels. A final note explained that the hour must come from the corrected appointment, not the grand announcement.\n\nThis was not an elaborate security system. Edmund liked leaving small puzzles for Nora when she visited, and the household knew his habits. He had apparently reused one now because he did not want the box opened casually before the meeting.\n\nYou copied the three tasks rather than attempting the lock by trial and error. A correct answer would tell you where to look next. An incorrect answer would mean returning to the instructions and checking the reasoning.\n\nMeanwhile, the others waited. Gideon asked whether the box might contain the will. Nora asked whether it contained a letter. Celia asked whether the police should open it instead.\n\nYou decided to record its condition and solve the instructions with witnesses present. Nothing would be removed or destroyed. If Edmund had prepared an account of the evening, everyone deserved to know what it actually said.",
        },
        {
          id: "CH21",
          chapterNumber: 21,
          title: "The Missing Announcement",
          body: "On the desk, beneath a blotter, you found a draft of Edmund's announcement. It named a charitable trust that would preserve the house and collection for public study. Staff posts would continue. Nora would receive a private allowance, but no authority to sell the collection.\n\nThe draft explained several fears and several mistakes. Nora had believed she would lose her home without support. Martha knew more of the employment arrangements. Gideon had assumed the collection might be dispersed. None of those assumptions was the whole plan.\n\nAt the bottom Edmund had added: 'Before signature, the inventory must be corrected and the unauthorized transfers reported.' He had underlined 'before'.\n\nThe announcement was not simply about inheritance. It was about moving the collection into a structure where its contents and accounts would be examined independently. Someone who had relied on informal authority would soon have to explain formal records.\n\nYou showed the draft to the group. Celia read it twice. Gideon began to speak, then stopped when Nora asked him what he had bought.\n\nThe house seemed smaller now. Its secrets were no longer spread across generations. They were converging on a few dates, a few payments, and the last private conversation Edmund had expected to finish before half past nine.",
        },
        {
          id: "CH22",
          chapterNumber: 22,
          title: "Two Doors, One Account",
          body: "You walked the route from the library service door to the archive with Martha. At an ordinary pace it took less than a minute. The passage bent beside the pantry, which explained why Arthur could hear the door without seeing who used it.\n\nThere was no secret architecture to discover. No panel moved. No bell rope led elsewhere. The ordinary route was enough to allow someone to leave the library after 9:14 and be seated in the archive when you passed at 9:20.\n\nThat established possibility, not identity. Arthur knew the passage; Martha used it daily. Several others could have found it. You marked it on a simple plan and returned to the evidence that distinguished one person from another.\n\nThe key book proved Celia borrowed the cupboard key at 9:10. Her own account admitted visiting Edmund. The photograph contradicted her explanation of the torn cuff. The financial records contradicted her explanation of the absent drawings.\n\nNo single clock trick was needed. No impossible locked room needed to be explained. The difficulty was quieter: a person had told a plausible story during a stretch of time when nobody could check it.\n\nYou asked each guest to write one correction to their earlier statement. Most found something to change. Celia wrote that she had no corrections.",
        },
        {
          id: "CH23",
          chapterNumber: 23,
          title: "The Last Questions",
          body: "Before accusing anyone, you made three columns in your notebook: motive, opportunity and physical connection. Each suspect belonged in at least one column. Only a supported account joining all three would justify a conclusion.\n\nYou placed Nora's debt beside Martha's corroborated upstairs interval. You placed Felix's professional quarrel beside the gaps in the telephone evidence. You placed Gideon's questionable purchases beside your own sight of him in the gallery when the bell rang.\n\nArthur's coal theft explained his fear, but not the cloth. Martha's omission protected Nora, but her revised account could be tested. Celia's explanations required the photograph to be misleading, the payment to be innocent, and an unwitnessed return to the archive to be accepted as fact.\n\nThose were questions, not yet a verdict. You needed the contents of the dispatch box, a proper comparison of the fragment, and a reconstruction that did not invent actions nobody had reason to perform.\n\nOutside, someone shouted from the drive. The constable and a second man had crossed the shallowest part of the lane on foot. Martha went to let them in.\n\nYou closed your notebook. Soon someone would ask for an answer. The difference between suspicion and an accusation would lie in how carefully you could explain the path from one to the other.",
        },
        {
          id: "CH24",
          chapterNumber: 24,
          title: "Before the Final Bell",
          body: "The constable took charge of the library, recorded the position of the bell and preserved the cloth fragment. He asked you to remain available, along with everyone who had heard the sound at 9:14.\n\nYou handed him your notes in time order. Where you had witnessed something yourself, you said so. Where you relied on another person's account, you named them. Where a time was approximate, you left it approximate.\n\nThe house no longer seemed theatrical. A frightened niece sat beside a housekeeper who had tried to protect her. A doctor waited to defend his judgement. A dealer rehearsed explanations that would not improve with repetition. A groundskeeper held his borrowed tie between both hands. An archivist watched the papers.\n\nEdmund's dispatch box stood in the centre of the gallery table. The combination tasks lay beside it, ready to be solved. His final record would not replace the other evidence; it would have to be read against it.\n\nThe gallery clock moved towards ten. You thought of the invitation's final sentence: a witness with no interest in the outcome. That had never meant a witness without responsibility.\n\nNow decide what the evidence supports. Open the appropriate packets, test the contradictions, and write your accusation before consulting the separate Solution Guide. The last bell of Ashcombe House has sounded. The next words belong to you.",
        },
      ],

      /* ══ fullNarrative is auto-generated below ══ */
      fullNarrative: "",
    },

    /* ══════════════════════════════════════════════════════════════
       CHARACTERS
       ══════════════════════════════════════════════════════════════ */
    characters: [
      {
        id: "C1",
        name: "Celia Ward",
        age: 36,
        role: "Suspect",
        occupation: "Archivist",
        personality: "Composed, precise and guarded when challenged.",
        background:
          "The family archivist responsible for collection records, inventory papers and conservation correspondence. Edmund has discovered discrepancies in her records.",
        motive:
          "Edmund questioned her records and asked her to bring the blue folio.",
        alibi:
          "Borrowed the cupboard key at 9:10. Says she left the library in under a minute and stayed in the archive until 9:20. No witness confirms the intervening minutes.",
        isCulprit: true,
        publicInformation: {
          appearance: "Plum jacket; pale violet cuffs; round spectacles.",
          mannerisms: "Composed, precise and guarded when challenged.",
          knownFacts: [
            "Edmund questioned her records and asked her to bring the blue folio.",
            "Borrowed the cupboard key at 9:10. Says she left the library in under a minute and stayed in the archive until 9:20. No witness confirms the intervening minutes.",
            "Says the right cuff tore that afternoon. Says the missing drawing is in York for conservation.",
          ],
        },
        privateInformation: {
          secret:
            "She diverted 480 pounds from unauthorized sales to her private commission account and supplied false authority in Edmund's name.",
          suspiciousBehavior:
            "Says the right cuff tore that afternoon. Says the missing drawing is in York for conservation.",
          alibiTruth:
            "She did not make the claimed immediate return. The evidence supports a confrontation around 9:14 and a return through the service passage before she is observed at 9:20.",
        },
        evidenceIds: ["E03", "E05", "E06", "E07", "E08"],
        investigationQuestion:
          "Which claims have independent support? What does the photograph actually disprove?",
      },
      {
        id: "C2",
        name: "Nora Ashcombe",
        age: 27,
        role: "Suspect",
        occupation: "Niece",
        personality:
          "Anxious, emotional and protective of the theatre company she helped.",
        background:
          "Edmund's niece, who borrowed money to support a theatre company. She fears that the new estate arrangements will leave her without a home or support.",
        motive:
          "Owes money after supporting a theatre company. Feared losing the house and her allowance.",
        alibi:
          "Martha places her upstairs from 9:12 to 9:18, holding a lamp while the leak was inspected.",
        isCulprit: false,
        publicInformation: {
          appearance: "Emerald evening dress; pearl earrings.",
          mannerisms:
            "Anxious, emotional and protective of the theatre company she helped.",
          knownFacts: [
            "Owes money after supporting a theatre company. Feared losing the house and her allowance.",
            "Martha places her upstairs from 9:12 to 9:18, holding a lamp while the leak was inspected.",
            "Concealed a creditor letter in her evening bag. She later surrendered it.",
          ],
        },
        privateInformation: {
          secret:
            "Concealed a creditor letter in her evening bag. She later surrendered it.",
          suspiciousBehavior:
            "Concealed a creditor letter in her evening bag. She later surrendered it.",
          alibiTruth:
            "Martha corroborates her presence upstairs from 9:12 to 9:18, covering the crucial sound at 9:14.",
        },
        evidenceIds: ["E02", "E04", "E10"],
        investigationQuestion:
          "Does a financial motive outweigh a corroborated account of her location?",
      },
      {
        id: "C3",
        name: "Dr Felix Mercer",
        age: 49,
        role: "Suspect",
        occupation: "Family doctor",
        personality:
          "Initially defensive, then willing to distinguish observation from uncertainty.",
        background:
          "Edmund's longtime physician. Edmund intends to withdraw support from a clinic Felix endorsed, threatening professional embarrassment.",
        motive:
          "Edmund threatened to withdraw support from a clinic Felix had endorsed.",
        alibi:
          "Call connected at 9:09. Gideon saw him in the alcove at 9:13 and 9:16. The interval is not continuously witnessed.",
        isCulprit: false,
        publicInformation: {
          appearance: "Charcoal suit; white shirt; neat moustache.",
          mannerisms:
            "Initially defensive, then willing to distinguish observation from uncertainty.",
          knownFacts: [
            "Edmund threatened to withdraw support from a clinic Felix had endorsed.",
            "Call connected at 9:09. Gideon saw him in the alcove at 9:13 and 9:16. The interval is not continuously witnessed.",
            "Initially resisted questions about his professional dispute.",
          ],
        },
        privateInformation: {
          secret:
            "Initially resisted questions about his professional dispute.",
          suspiciousBehavior:
            "Initially resisted questions about his professional dispute.",
          alibiTruth:
            "Gideon sees him in the telephone alcove at 9:13 and 9:16. The time between those observations remains unverified; do not invent a continuous alibi.",
        },
        evidenceIds: ["E02", "E04"],
        investigationQuestion:
          "Which minutes are observed, and which are assumptions?",
      },
      {
        id: "C4",
        name: "Gideon Pike",
        age: 44,
        role: "Suspect",
        occupation: "Art and manuscript dealer",
        personality:
          "Polite and commercially confident, but evasive about his due diligence.",
        background:
          "A dealer who bought two drawings on the strength of letters supplied by Celia, without confirming authority directly with Edmund.",
        motive:
          "Bought works under letters of authority supplied by Celia; exposure could damage his business.",
        alibi:
          "Investigator places him at the map-room doorway when the bell sounded at 9:14.",
        isCulprit: false,
        publicInformation: {
          appearance: "Tan suit; burgundy tie; blond hair.",
          mannerisms:
            "Polite and commercially confident, but evasive about his due diligence.",
          knownFacts: [
            "Bought works under letters of authority supplied by Celia; exposure could damage his business.",
            "Investigator places him at the map-room doorway when the bell sounded at 9:14.",
            "Accepted a restoration-fund explanation without asking Edmund directly.",
          ],
        },
        privateInformation: {
          secret:
            "Accepted a restoration-fund explanation without asking Edmund directly.",
          suspiciousBehavior:
            "Accepted a restoration-fund explanation without asking Edmund directly.",
          alibiTruth:
            "The investigator sees him at the map-room doorway in the gallery when the bell sounds at 9:14.",
        },
        evidenceIds: ["E04", "E06"],
        investigationQuestion:
          "Does the machine defect identify an author, or only a machine?",
      },
      {
        id: "C5",
        name: "Martha Reed",
        age: 57,
        role: "Suspect",
        occupation: "Housekeeper",
        personality:
          "Protective, practical and deeply familiar with the household.",
        background:
          "A housekeeper who has worked at Ashcombe House for twenty-nine years. Edmund told her the proposed trust would protect resident staff jobs.",
        motive:
          "Worried about staff and Nora. Edmund had privately promised continued employment under the trust.",
        alibi:
          "With Nora upstairs from 9:12 to 9:18. Delivered the bell at 9:08. Saw the key returned at 9:22.",
        isCulprit: false,
        publicInformation: {
          appearance: "Navy dress; white collar; pinned grey-streaked hair.",
          mannerisms:
            "Protective, practical and deeply familiar with the household.",
          knownFacts: [
            "Worried about staff and Nora. Edmund had privately promised continued employment under the trust.",
            "With Nora upstairs from 9:12 to 9:18. Delivered the bell at 9:08. Saw the key returned at 9:22.",
            "First omitted the upstairs trip to protect Nora from embarrassment, then corrected her account.",
          ],
        },
        privateInformation: {
          secret:
            "First omitted the upstairs trip to protect Nora from embarrassment, then corrected her account.",
          suspiciousBehavior:
            "First omitted the upstairs trip to protect Nora from embarrassment, then corrected her account.",
          alibiTruth:
            "Her corrected account places her upstairs with Nora from 9:12 to 9:18. Her initial omission concealed Nora's distress.",
        },
        evidenceIds: ["E03", "E04", "E10"],
        investigationQuestion:
          "Does an omission explain another secret rather than the killing?",
      },
      {
        id: "C6",
        name: "Arthur Bell",
        age: 41,
        role: "Suspect",
        occupation: "Groundskeeper",
        personality:
          "Nervous and careful not to claim more than he actually witnessed.",
        background:
          "The estate groundskeeper, trapped at the house by the flood. He borrowed a tie for supper and fears dismissal after taking coal for his sister.",
        motive: "Had taken estate coal for his sister and feared dismissal.",
        alibi:
          "Heard the bell and the service door at 9:14 from a bend in the corridor. Reached the kitchen about 9:17.",
        isCulprit: false,
        publicInformation: {
          appearance: "Brown work coat; muddy boots; borrowed tie.",
          mannerisms:
            "Nervous and careful not to claim more than he actually witnessed.",
          knownFacts: [
            "Had taken estate coal for his sister and feared dismissal.",
            "Heard the bell and the service door at 9:14 from a bend in the corridor. Reached the kitchen about 9:17.",
            "Admitted taking coal. Never claimed to have seen the person at the service door.",
          ],
        },
        privateInformation: {
          secret:
            "Admitted taking coal. Never claimed to have seen the person at the service door.",
          suspiciousBehavior:
            "Admitted taking coal. Never claimed to have seen the person at the service door.",
          alibiTruth:
            "He heard the service door but did not see its user. He reached the kitchen about 9:17; parts of his route are not continuously observed.",
        },
        evidenceIds: ["E04", "E12"],
        investigationQuestion:
          "What can a sound establish? Why is an ordinary muddy mark not a unique identification?",
      },
    ],

    /* ══════════════════════════════════════════════════════════════
       CLUES
       ══════════════════════════════════════════════════════════════ */
    clues: [
      {
        id: "CL1",
        title: "The single bell at 9:14",
        description:
          "The investigator hears one bell note followed by a heavy noise. Arthur hears the service door close shortly afterwards.",
        type: "Testimony",
        importance: "Critical",
        discoveryLocation: "Gallery and service corridor",
        hint: "Compare the sound with witnessed locations, rather than assigning an exact medical time of death.",
        isRedHerring: false,
        evidenceIds: ["E01", "E02", "E04"],
      },
      {
        id: "CL2",
        title: "Plate G-17",
        description:
          "The right cuff is complete at 9:05, including the old triangular repair and double stitching.",
        type: "Document",
        importance: "Critical",
        discoveryLocation: "Gallery photograph",
        hint: "Compare this intact state with the cuff seen at 9:20.",
        isRedHerring: false,
        evidenceIds: ["E05"],
      },
      {
        id: "CL3",
        title: "The fitted cuff fragment",
        description:
          "The fragment preserved in Edmund's hand fits three corners of Celia's torn cuff; stitch lines and part of the repair continue across the join.",
        type: "Physical Evidence",
        importance: "Critical",
        discoveryLocation: "Edmund's left hand",
        hint: "Combine the physical fit with the photograph to date the contact.",
        isRedHerring: false,
        evidenceIds: ["E05", "E08"],
      },
      {
        id: "CL4",
        title: "The cupboard key interval",
        description:
          "Celia takes the cupboard key at 9:10 and returns it at 9:22. No witness verifies her claimed immediate return to the archive.",
        type: "Document",
        importance: "Major",
        discoveryLocation: "Pantry register",
        hint: "A key register is not a door-entry log.",
        isRedHerring: false,
        evidenceIds: ["E03"],
      },
      {
        id: "CL5",
        title: "The private account",
        description:
          "The two original drawings sold for 480 pounds; the matching remittance names C. Ward's private commission account.",
        type: "Document",
        importance: "Critical",
        discoveryLocation: "Pike's records and archive tray",
        hint: "Compare the payee with the claimed restoration fund.",
        isRedHerring: false,
        evidenceIds: ["E06"],
      },
      {
        id: "CL6",
        title: "The declined conservation booking",
        description:
          "York declined the booking and states that no drawing was delivered, contradicting the explanation given at the house.",
        type: "Document",
        importance: "Major",
        discoveryLocation: "Archive correspondence tray",
        hint: "Use the dated reply together with the completed sale.",
        isRedHerring: false,
        evidenceIds: ["E06", "E07"],
      },
      {
        id: "CL7",
        title: "The carbon audit",
        description:
          "Edmund denies authorizing the sales and records a private meeting with Celia before the announcement. The locked copy survived removal of the visible original.",
        type: "Document",
        importance: "Critical",
        discoveryLocation: "Dispatch box, sealed packet E09",
        hint: "Solve P1-P3 before opening this packet.",
        isRedHerring: false,
        evidenceIds: ["E09"],
      },
      {
        id: "CL8",
        title: "The ordinary service route",
        description:
          "The unlocked library service door leads through a bend by the pantry to the archive in less than a minute.",
        type: "Physical Evidence",
        importance: "Major",
        discoveryLocation: "Service passage",
        hint: "The route explains possibility, not identity.",
        isRedHerring: false,
        evidenceIds: ["E12"],
      },
      {
        id: "CL9",
        title: "The raised capital R",
        description:
          "The archive typewriter defect appears on provenance papers. The machine can be used by more than one person.",
        type: "Document",
        importance: "Supporting",
        discoveryLocation: "Archive typewriter",
        hint: "Identify a shared machine without treating it as a unique signature.",
        isRedHerring: false,
        evidenceIds: ["E06"],
      },
      {
        id: "CL10",
        title: "Nora's creditor letter",
        description:
          "Nora owes 120 pounds after supporting a theatre company and fears losing support. Martha places her upstairs at 9:14.",
        type: "Document",
        importance: "Major",
        discoveryLocation: "Nora's evening bag",
        hint: "A strong financial pressure does not erase a corroborated location.",
        isRedHerring: true,
        evidenceIds: ["E04", "E10"],
      },
      {
        id: "CL11",
        title: "Arthur's coal theft and muddy boots",
        description:
          "Arthur admits taking coal. Water and mud in the passage do not identify a unique visitor.",
        type: "Physical Evidence",
        importance: "Supporting",
        discoveryLocation: "Coal store and service corridor",
        hint: "Do not turn a common muddy mark into an identification.",
        isRedHerring: true,
        evidenceIds: ["E04", "E12"],
      },
      {
        id: "CL12",
        title: "Martha's corrected omission",
        description:
          "She initially omitted the upstairs trip to protect Nora, then gave an account covering 9:12-9:18.",
        type: "Testimony",
        importance: "Supporting",
        discoveryLocation: "Housekeeper interview",
        hint: "A lie or omission can conceal a different secret.",
        isRedHerring: true,
        evidenceIds: ["E04", "E10"],
      },
      {
        id: "CL13",
        title: "Felix's professional quarrel",
        description:
          "Edmund intended to withdraw clinic support. Felix's telephone sightings leave gaps, but no fitted textile evidence connects him to the struggle.",
        type: "Testimony",
        importance: "Supporting",
        discoveryLocation: "Telephone alcove",
        hint: "An imperfect alibi is not affirmative proof of murder.",
        isRedHerring: true,
        evidenceIds: ["E02", "E04"],
      },
    ],

    /* ══════════════════════════════════════════════════════════════
       EVIDENCE
       ══════════════════════════════════════════════════════════════ */
    evidence: [
      {
        id: "E01",
        title: "The library scene",
        type: "Investigation Report",
        body: "Scene record: Library, Ashcombe House. Discovery at 9:32 p.m. Edmund lies beside the writing desk. No sign of a forced window. Both ordinary doors are unlocked. The service door leads to the pantry passage.\n\nObjects observed: Swallow-handled brass bell on the carpet; crescent chip in its base; dark transfer mark along the chipped edge. The bell is a possible weapon, not a scientifically confirmed one. Do not infer a precise death time from the mark.\n\nDesk: Blue folio, broken seal; one sheet has been torn away leaving a narrow attached margin. Locked three-wheel dispatch box. Unsent envelope beneath the blotter. Nothing has been tidied or removed by the investigators.\n\nHand: Pale violet cloth fragment, including double stitching and part of a triangular repair, preserved in Edmund's left hand until the constable attends.\n\nMedical observation: Felix reports death and a head injury consistent with a heavy blow. He cannot establish the exact minute. For game purposes, the bell and thud at 9:14 are the event the other evidence must explain.",
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E02",
        title: "The evening record",
        type: "Record",
        body: "Time | Recorded event | Source / limit\n9:05 | Gallery photograph; cuff intact | Investigator + plate G-17\n9:08 | Bell placed on library desk | Martha; investigator sees delivery\n9:09 | Felix connected to operator | Call pad; not a continuous alibi\n9:10 | Celia takes cupboard key | Arthur witnesses key entry\n9:12-9:18 | Nora and Martha upstairs | Martha's corrected account\n9:13 / 9:16 | Felix in telephone alcove | Gideon; interval unwatched\n9:14 | Bell, thud, then service door | Investigator + Arthur; Gideon in gallery\nAbout 9:17 | Arthur reaches kitchen | Cook's recollection\n9:20 | Celia at archive desk; cuff torn | Investigator sees her once\n9:22 | Key returned | Martha witnesses return\n9:32 | Edmund discovered | Martha opens library\n10:10 | Fragment comparison recorded | Constable; after narrative events",
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E03",
        title: "The cupboard key book",
        type: "Record",
        body: "Pantry key register, 17 October: Borrower: Celia Ward. Key: library document cupboard. Taken: 9:10 p.m. Returned: 9:22 p.m. Both entries are in Celia's handwriting.\n\nArthur witnessed the borrowing. Martha witnessed the return. Nobody watched the book or the key continuously between those times.\n\nThe key opens the cupboard containing the inventory papers. It does not open either library door; those doors were unlocked. Possessing the key does not, by itself, prove how long anyone remained in the room.\n\nCelia's statement: \"I took in the inventory folio, left Mr Ashcombe alive in less than a minute, and returned directly to the archive. I stayed there until twenty past. The cuff tore on a drawer that afternoon.\"\n\nInvestigator note: Celia was seen at the archive desk at 9:20. That observation does not account for every preceding minute.",
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E04",
        title: "Four witness extracts",
        type: "Witness Statement",
        body: 'The investigator: "The bell rang at 9:14. A heavy noise followed. Gideon stood beside the map-room doorway and said someone had dropped something. At 9:20 I saw Celia at her archive desk. Her right cuff had a jagged gap beside the old repair."\n\nArthur Bell: "I heard one bell note and then the service door close. I was at the bend in the passage, carrying a bucket. I did not see who used the door. I reached the kitchen about 9:17."\n\nMartha Reed: "Nora was with me upstairs from 9:12 until 9:18. She held the lamp while I inspected the leak. I put the bell on Edmund\'s desk at 9:08. I saw Celia return the key at 9:22."\n\nGideon Pike: "Felix was at the telephone when I passed at 9:13, and still there when I looked along the hall at 9:16. I did not watch the alcove between those times."\n\nReliability note: Martha first omitted the upstairs trip to spare Nora embarrassment. The correction is recorded openly. No witness reports an unidentified stranger, an altered clock or a locked-room mechanism.',
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E05",
        title: "Plate G-17: the intact cuff",
        type: "Photograph Record",
        body: "Contemporaneous exposure: Gallery, 9:05 p.m. The investigator read the clock aloud immediately before Arthur released the shutter. The single exposed plate was labelled G-17 and developed with the investigator present.\n\nEnlargement observation: Celia's right pale violet cuff is complete. Two parallel stitch lines cross the lower edge. A triangular repair sits near the seam. No gap is present beside it.\n\nComparison observation: At 9:20 the same cuff has a triangular section missing beside the repair. The afternoon-tear explanation is inconsistent with the earlier intact state.\n\nLimits: The plate alone narrows the damage to 9:05-9:20. It does not show a killing. Use E08 to examine the physical connection. The diagram below is the authoritative game enlargement; the suspect portrait is not evidence.",
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E06",
        title: "Two versions of a payment",
        type: "Financial Record",
        body: 'Pike & Co. sale statement, 3 October 1934: Original astronomical drawing and original river survey sold for a combined 480 pounds. Seller represented by Celia Ward under a letter of authority bearing Edmund Ashcombe\'s typed name.\n\nCovering letter to Gideon: "Please remit to the restoration fund account named in the attached instruction. E. Ashcombe prefers all conservation matters to pass through this office." Signed C. Ward.\n\nCarbon remittance advice: Payee: C. Ward, private commission account. Amount: 480 pounds. Reference: two original drawings, Ashcombe collection. This matches the sale statement; it does not describe an estate restoration account.\n\nInventory discrepancy: Both works remain listed as originals present in the house. Display frames now contain reproductions. Edmund pencilled beside the astronomical entry: "If the original is in York, why has London already sold it?"\n\nTypewriter: The authority letter and provenance notes share a raised right leg on capital R, matching the archive machine. The machine is accessible to others. This is supporting context, not proof of its operator.',
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E07",
        title: "The conservation reply",
        type: "Letter",
        body: 'York Drawing Conservation Workshop\n4 September 1934\nTo Miss C. Ward, Ashcombe House\n\n"Thank you for your enquiry. Regrettably we cannot accept the astronomical drawing this season. No object has been delivered to us in connection with your enquiry. Please do not arrange dispatch without a fresh booking."\n\nCollection check: The reply remains in the archive correspondence tray. There is no later booking or dispatch receipt in the case materials. The sale record in E06 independently locates the original outside the collection.\n\nCelia\'s explanation at 8:50 p.m., 17 October: "The original is in York for conservation. The framed photograph is only temporary."\n\nQuestion: Which documents contradict that explanation, and what is the difference between proving a false account of a drawing and proving responsibility for the death?',
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E08",
        title: "The fragment comparison",
        type: "Physical Comparison Report",
        body: "Constable's comparison note, 10:10 p.m.: The cloth removed from Edmund's hand was placed beside the missing section of Celia Ward's right cuff. The irregular edges join at three corners; both stitch lines continue across the join. One leg of the old triangular repair continues from cuff onto fragment.\n\nThe comparison is a direct physical fit under a magnifying glass. No chemical test, fibre database or modern DNA analysis is implied. Within this fictional case, accept the recorded fit as reliable.\n\nTiming: E05 places the cuff intact at 9:05. The investigator saw the gap at 9:20. Celia admits a library visit beginning at 9:10 and has no independently observed whereabouts until 9:20.\n\nAlternative claim: Celia says the damage happened in the afternoon. The image observation in E05 contradicts that claim. No earlier confrontation between her and Edmund within the 9:05-9:20 interval is reported apart from the private library meeting.\n\nReasoning limit: A cloth fit establishes contact and a false explanation. Combine it with the meeting, sound, route and financial records before making the accusation.",
        access: "Open after reading the story",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E09",
        title: "Inside the dispatch box",
        type: "Audit and Appointment",
        body: 'Carbon audit, signed Edmund Ashcombe, 17 October: "The original astronomical drawing and river survey have been disposed of without my authority. I have compared Pike\'s statement with the bank advice. Four hundred and eighty pounds went to C. Ward\'s private commission account. I have never authorized that account to receive estate proceeds."\n\n"The authority supplied to Pike bears my typed name; I did not issue it. Copies have been left in the frames and counted in the inventory as originals. These entries must be corrected before the trust is signed."\n\nPrivate appointment note: "C. Ward: bring the blue folio to the library after collecting the key at 9:10. We shall discuss the false authority and the missing proceeds privately, before my announcement at 9:30."\n\nDuplicate safeguard: The audit is the carbon counterpart of the sheet torn from the blue folio. The wording at the surviving margin matches. Removing the visible original did not remove this copy.\n\nDo now: Complete the timeline, compare alternatives and write your accusation. This packet proves the intended confrontation and the financial motive. It is not a confession and does not replace the physical evidence.',
        access: "SEALED: read only after code check",
        isSealed: true,
        unlockPuzzleIds: ["P1", "P2", "P3"],
        unlockCode: "417",
      },
      {
        id: "E10",
        title: "The trust and the creditor",
        type: "Record",
        body: "Announcement draft, Edmund's desk: Ashcombe House and the remaining collection will pass into a charitable study trust. Resident staff employment will continue. Nora is to receive a private allowance; she will not be able to sell the collection.\n\nFinal handwritten line: \"Before signature, the inventory must be corrected and the unauthorized transfers reported.\" The word \"before\" is underlined.\n\nCreditor letter, Nora's bag: A repayment of 120 pounds is overdue. Nora admits using the loan to support a theatre company. She had asked Edmund for help and feared the new arrangements would leave her without support.\n\nMartha's information: Edmund had told her that jobs would be protected. She omitted Nora's tears from her first account but later confirmed the upstairs interval.\n\nInvestigation prompt: Separate what Edmund actually planned from what each person feared. This evidence explains motive and misunderstanding; it does not move Nora out of Martha's sight at 9:14.",
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E11",
        title: "Edmund's three little tasks",
        type: "Puzzle Instructions",
        body: 'Slip beside the dispatch box: "The house, the order, the hour. Three answers, one lock. Read them in that order. Use the booklet and my corrected appointment."\n\nVisitor booklet verse:\nFrost silvers the silent lawn.\nOak leaves gather beside the stair.\nUnder the eaves the swallows sleep.\nRain keeps the evening waiting.\n\nBooklet margin: "Beginnings spell the first number. The second number sits on the second label after the labels are put in order."\n\nArchive labels: A carries 6; B carries 8; C carries 2; D carries 1. B stands immediately before D. C stands last. A stands after D. Use every label once.\n\nCorrected appointment, 16 October: "Telephone conference with solicitor: seven in the evening, replacing nine. Take only the corrected hour as the third digit. This is yesterday\'s conference, not tonight\'s announcement."\n\nAll the needed information is reproduced on P1-P3. Do not use the date, the victim\'s age or any real-world historical fact as an extra key.',
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
      {
        id: "E12",
        title: "An ordinary service passage",
        type: "Map and Route Record",
        body: "Route record: The library has two ordinary unlocked doors. The main door opens to the gallery. The service door opens to a passage that bends by the pantry before reaching the archive and kitchen.\n\nA walk from the library service door to the archive takes less than one minute at an ordinary pace. The bend prevents Arthur, near the kitchen side, from seeing the library doorway at 9:14.\n\nThe map is schematic, not to scale. The gallery is on the ground floor. The east stair leads to the upstairs linen room where Martha and Nora were together from 9:12 to 9:18.\n\nNo hidden mechanism: No secret door, altered clock or remote bell exists in this case. Mud and water in the passage cannot identify a unique visitor. The route establishes opportunity only.",
        access: "Open from the start",
        isSealed: false,
        unlockPuzzleIds: [],
        unlockCode: null,
      },
    ],

    /* ══════════════════════════════════════════════════════════════
       PUZZLES
       ══════════════════════════════════════════════════════════════ */
    puzzles: [
      {
        id: "P1",
        title: "The house speaks first",
        type: "Acrostic",
        difficulty: "Easy",
        question:
          'Edmund wrote: "Beginnings spell the first number." Read the first letter of each line in order and turn the resulting number word into a digit.',
        puzzleData: {
          lines: [
            "Frost silvers the silent lawn.",
            "Oak leaves gather beside the stair.",
            "Under the eaves the swallows sleep.",
            "Rain keeps the evening waiting.",
          ],
          codePosition: 1,
        },
        answer: "4",
        explanation: "F-O-U-R spells FOUR. The first digit is 4.",
        hints: [
          "Read the beginnings of the lines, not the number of words.",
          "Write the first letter of Frost, Oak, Under and Rain in order.",
          "The letters form a number word.",
        ],
      },
      {
        id: "P2",
        title: "Put the labels in order",
        type: "Logic",
        difficulty: "Medium",
        question:
          "Use A, B, C and D exactly once. B stands immediately before D. C stands last. A stands after D. Take the value on the second label after arranging them.",
        puzzleData: {
          labels: [
            { label: "A", value: 6 },
            { label: "B", value: 8 },
            { label: "C", value: 2 },
            { label: "D", value: 1 },
          ],
          rules: ["B immediately before D", "C last", "A after D"],
          codePosition: 2,
        },
        answer: "1",
        explanation:
          "The unique order is B-D-A-C. D is second and carries 1. If B-D occupied places 2-3, A could not follow D because C is last.",
        hints: [
          "Treat an immediate pair as one block.",
          "Reserve the last place for C.",
          "Place B-D where A can still stand after D; then read the second label's value.",
        ],
      },
      {
        id: "P3",
        title: "Use the corrected hour",
        type: "Deduction",
        difficulty: "Easy",
        question:
          'The appointment of 16 October says: "Telephone conference with solicitor: seven in the evening, replacing nine. Take only the corrected hour as the third digit." What digit is required?',
        puzzleData: {
          date: "1934-10-16",
          cancelledHour: 9,
          correctedHour: 7,
          codePosition: 3,
          combinedCodeOrder: ["P1", "P2", "P3"],
          unlockEvidenceId: "E09",
        },
        answer: "7",
        explanation:
          "Use the corrected hour, seven. P1-P3 give 4-1-7, opening E09. This is the previous day's conference, not the 9:30 announcement.",
        hints: [
          "Use the replacement time, not the cancelled time.",
          "The note is from the previous day.",
          "The corrected hour is written as a word.",
        ],
      },
      {
        id: "P4",
        title: "Reconstruct the interval",
        type: "Timeline Worksheet",
        difficulty: "Medium",
        question:
          "Reconstruct events between 9:05 and 9:32. Mark each as observation, claim or inference. Identify the important unobserved interval.",
        puzzleData: {
          timeSlots: [
            "21:05",
            "21:08-21:10",
            "21:12-21:14",
            "21:14-21:18",
            "21:20",
            "21:22",
            "21:32",
          ],
          evidenceIds: ["E02", "E03", "E04", "E05", "E12"],
          isOpenEnded: true,
        },
        answer:
          "The crucial unobserved interval is 9:10-9:20. Celia admits visiting Edmund after taking the key, but nobody verifies an immediate return. The bell and thud occur at 9:14; she is seen in the archive with the torn cuff at 9:20.",
        explanation:
          "Keep key borrowing separate from room occupancy and do not turn a single later sighting into a continuous alibi.",
        hints: [
          "Which person admits visiting the victim?",
          "Which return time is a claim rather than a witnessed event?",
          "Compare the two observations of the cuff.",
        ],
      },
      {
        id: "P5",
        title: "Test your strongest alternative",
        type: "Suspect Matrix",
        difficulty: "Medium",
        question:
          "For each suspect record motive, opportunity and physical connection. Choose the strongest alternative and explain what weakens it.",
        puzzleData: {
          suspectIds: ["C1", "C2", "C3", "C4", "C5", "C6"],
          columns: ["Motive", "Opportunity", "Physical connection"],
          isOpenEnded: true,
        },
        answer:
          "Celia alone is supported by the combined financial confrontation, admitted visit, newly torn cuff, physical fit and false tear explanation. Other suspects have pressures or gaps, but no equivalent physical chain.",
        explanation:
          "An innocent person need not have a perfect alibi. Reject alternatives using positive evidence and its limits, not a blanket assumption of honesty.",
        hints: [
          "A secret is not a physical connection.",
          "Martha corroborates Nora's upstairs location.",
          "Compare each alternative with E05 and E08.",
        ],
      },
      {
        id: "P6",
        title: "Make one supported accusation",
        type: "Final Deduction",
        difficulty: "Medium",
        question:
          "Name the culprit, explain the confrontation and likely method and route, cite three evidence IDs, and reject your strongest alternative.",
        puzzleData: {
          prompts: [
            "Who caused Edmund's death?",
            "Why did the confrontation occur?",
            "What are the likely method and route?",
            "Which three evidence IDs support the accusation?",
            "Why is the strongest alternative weaker?",
          ],
          isOpenEnded: true,
        },
        answer:
          "Celia Ward, threatened with exposure for unauthorized sales and diverted proceeds, most likely struck Edmund with the brass bell at about 9:14 and returned through the service passage before 9:20. Cite E05 and E08 for the dated physical fit, E03 for the admitted visit and E09 for the confrontation and motive.",
        explanation:
          "The exact spoken words, order of grab and blow, and precise medical death time are not known. State the best-supported reconstruction without inventing a confession.",
        hints: [
          "Separate motive, opportunity and physical connection.",
          "Use the photograph and comparison report together.",
          "Explain how the ordinary route fits the archive sighting.",
        ],
      },
    ],

    /* ══════════════════════════════════════════════════════════════
       TIMELINE
       ══════════════════════════════════════════════════════════════ */
    playerTimeline: [
      {
        id: "PT1",
        time: "9:05",
        location: "Gallery",
        description: "Gallery photograph; cuff intact",
        source: "Investigator + plate G-17",
        date: "1934-10-17",
      },
      {
        id: "PT2",
        time: "9:08",
        location: "Library",
        description: "Bell placed on library desk",
        source: "Martha; investigator sees delivery",
        date: "1934-10-17",
      },
      {
        id: "PT3",
        time: "9:09",
        location: "Telephone alcove",
        description: "Felix connected to operator",
        source: "Call pad; not a continuous alibi",
        date: "1934-10-17",
      },
      {
        id: "PT4",
        time: "9:10",
        location: "Pantry key register",
        description: "Celia takes cupboard key",
        source: "Arthur witnesses key entry",
        date: "1934-10-17",
      },
      {
        id: "PT5",
        time: "9:12-9:18",
        location: "Upstairs linen room",
        description: "Nora and Martha upstairs",
        source: "Martha's corrected account",
        date: "1934-10-17",
      },
      {
        id: "PT6",
        time: "9:13 / 9:16",
        location: "Telephone alcove",
        description: "Felix in telephone alcove",
        source: "Gideon; interval unwatched",
        date: "1934-10-17",
      },
      {
        id: "PT7",
        time: "9:14",
        location: "Library / gallery / service passage",
        description: "Bell, thud, then service door",
        source: "Investigator + Arthur; Gideon in gallery",
        date: "1934-10-17",
      },
      {
        id: "PT8",
        time: "About 9:17",
        location: "Kitchen",
        description: "Arthur reaches kitchen",
        source: "Cook's recollection",
        date: "1934-10-17",
      },
      {
        id: "PT9",
        time: "9:20",
        location: "Archive",
        description: "Celia at archive desk; cuff torn",
        source: "Investigator sees her once",
        date: "1934-10-17",
      },
      {
        id: "PT10",
        time: "9:22",
        location: "Pantry key register",
        description: "Key returned",
        source: "Martha witnesses return",
        date: "1934-10-17",
      },
      {
        id: "PT11",
        time: "9:32",
        location: "Library",
        description: "Edmund discovered",
        source: "Martha opens library",
        date: "1934-10-17",
      },
      {
        id: "PT12",
        time: "10:10",
        location: "Library / gallery comparison",
        description: "Fragment comparison recorded",
        source: "Constable; after narrative events",
        date: "1934-10-17",
      },
    ],

    /* ══════════════════════════════════════════════════════════════
       SOLUTION
       ══════════════════════════════════════════════════════════════ */
    solution: {
      culprit: "Celia Ward",
      motive:
        "Edmund had discovered the unauthorized sale of two original drawings for 480 pounds, false authority letters and the diversion of funds into Celia's private commission account. He planned to report the transfers and correct the inventory before signing the collection into a charitable trust.",
      method:
        "The evidence supports a confrontation around 9:14 during Celia's admitted library visit. Edmund caught her cuff during the struggle; she most likely struck him with the swallow-handled brass bell. She then most likely removed the visible audit sheet and used the ordinary service passage to reach the archive before the 9:20 sighting. The exact order of the grab and blow is reconstructed, not witnessed.",
      fullTimelineNarrative:
        "At 9:05 plate G-17 records the cuff intact. Martha places the bell on Edmund's desk at 9:08. At 9:10 Celia borrows the cupboard key and visits Edmund for the meeting recorded in E09. No one verifies her claimed immediate return. A bell note, thud and door sound occur at 9:14. The best-supported reconstruction is a struggle and bell strike, followed by removal of the visible audit and exit through the service passage. Celia is seen at her archive desk at 9:20 with a torn cuff and returns the key at 9:22. Edmund is discovered at 9:32. At 10:10 the constable records the fitted fragment. The preserved carbon audit survives inside the dispatch box.",
      clueExplanations: [
        {
          clueId: "CL1",
          meaning:
            "The sound anchors the likely confrontation around 9:14; the record is not a precise medical death-time determination.",
        },
        {
          clueId: "CL2",
          meaning:
            "The intact cuff at 9:05 disproves an afternoon tear when compared with the later missing section.",
        },
        {
          clueId: "CL3",
          meaning:
            "A reliable direct physical fit ties the fragment to Celia's cuff; the dated images narrow the contact to the critical interval.",
        },
        {
          clueId: "CL4",
          meaning:
            "Borrowing the key and admitting a visit create opportunity. The register does not verify a prompt exit.",
        },
        {
          clueId: "CL5",
          meaning:
            "The named private account and matching 480-pound payment expose diversion of proceeds.",
        },
        {
          clueId: "CL6",
          meaning:
            "The dated refusal contradicts the claim that the original was in York for conservation.",
        },
        {
          clueId: "CL7",
          meaning:
            "The audit records Edmund's denial of authority and a planned private confrontation, supplying the reason for the crisis.",
        },
        {
          clueId: "CL8",
          meaning:
            "A normal route permits departure after the bell and arrival in the archive before 9:20; no secret mechanism is needed.",
        },
        {
          clueId: "CL9",
          meaning:
            "The defective R links documents to a machine but cannot alone identify its operator.",
        },
      ],
      redHerringExplanations: [
        {
          clueId: "CL10",
          whyMisleading:
            "Nora's debt is real, but Martha places her upstairs from 9:12 to 9:18. No fitted cloth links her to the confrontation.",
        },
        {
          clueId: "CL11",
          whyMisleading:
            "Arthur's fear concerns coal theft. Hearing the service door does not prove he used it, and common mud cannot identify its user.",
        },
        {
          clueId: "CL12",
          whyMisleading:
            "Martha's omission protected Nora's embarrassment. The corrected account concerns an upstairs trip, not a physical link to the killing.",
        },
        {
          clueId: "CL13",
          whyMisleading:
            "Felix has a professional motive and an incomplete telephone alibi, but neither explains the newly torn cuff and exact fit.",
        },
      ],
      puzzleAnswers: [
        {
          puzzleId: "P1",
          answer: "4",
          explanation: "F-O-U-R spells FOUR. The first digit is 4.",
        },
        {
          puzzleId: "P2",
          answer: "1",
          explanation:
            "The unique order is B-D-A-C. D is second and carries 1. If B-D occupied places 2-3, A could not follow D because C is last.",
        },
        {
          puzzleId: "P3",
          answer: "7",
          explanation:
            "Use the corrected hour, seven. P1-P3 give 4-1-7, opening E09. This is the previous day's conference, not the 9:30 announcement.",
        },
        {
          puzzleId: "P4",
          answer:
            "The crucial unobserved interval is 9:10-9:20. Celia admits visiting Edmund after taking the key, but nobody verifies an immediate return. The bell and thud occur at 9:14; she is seen in the archive with the torn cuff at 9:20.",
          explanation:
            "Keep key borrowing separate from room occupancy and do not turn a single later sighting into a continuous alibi.",
        },
        {
          puzzleId: "P5",
          answer:
            "Celia alone is supported by the combined financial confrontation, admitted visit, newly torn cuff, physical fit and false tear explanation. Other suspects have pressures or gaps, but no equivalent physical chain.",
          explanation:
            "An innocent person need not have a perfect alibi. Reject alternatives using positive evidence and its limits, not a blanket assumption of honesty.",
        },
        {
          puzzleId: "P6",
          answer:
            "Celia Ward, threatened with exposure for unauthorized sales and diverted proceeds, most likely struck Edmund with the brass bell at about 9:14 and returned through the service passage before 9:20. Cite E05 and E08 for the dated physical fit, E03 for the admitted visit and E09 for the confrontation and motive.",
          explanation:
            "The exact spoken words, order of grab and blow, and precise medical death time are not known. State the best-supported reconstruction without inventing a confession.",
        },
      ],
      finalDeductionWalkthrough:
        "First establish that the cupboard register records a borrowing interval, not a verified return to the archive. Next combine plate G-17 at 9:05, the torn cuff observed at 9:20 and the fitted fragment from Edmund's hand. Celia's afternoon-tear explanation is false. E06-E07 identify a false conservation story and a payment to her private account; E09 records Edmund's denial of authority and the intended private confrontation. E12 shows a normal route from the library to the archive within a minute. This chain joins motive, opportunity and physical contact in the interval containing the 9:14 sound. It is stronger than suspicion based on debt, an imperfect alibi or a machine defect.",
      caseConclusion:
        "Celia Ward is responsible for Edmund Ashcombe's death. The supported reconstruction is a bell strike during the confrontation over unauthorized sales. Nora, Felix, Gideon, Martha and Arthur have secrets or difficult explanations, but none accounts for the dated physical fit. The carbon audit ensures the financial truth survives.",
      fullGuideText:
        "AN ORIGINAL COUNTRY-HOUSE MYSTERY\nTHE LAST BELL\nOF ASHCOMBE\nHOUSE\nSOLUTION GUIDE\nSPOILERS. Keep closed until you have submitted your accusation. The first section\ncontains optional graduated hints.\n1-6 INVESTIGATORS  |  90-120 MINUTES  |  AGES 14+\nAn autumn storm. Six suspects. One unfinished announcement.\n\nASHCOMBE HOUSE / CASE FILE\nSOLUTION GUIDE / SPOILERS\n02\nHINT LADDER / NO CULPRIT NAME\nHints before answers\nP1 / GENTLE, THEN STRONGER\nRead the beginnings of the four lines, not the number of words. If needed,\nwrite the first letters of Frost, Oak, Under and Rain in order, then read the\nresult as a number word.\nP2 / GENTLE, THEN STRONGER\nTreat an immediate pair as a block and reserve the fourth place for C. If\nneeded, place the B-D block so A can stand after D. Read the value on the\nsecond label.\nP3 / GENTLE\nUse the replacement hour, not the cancelled hour. The note is from the\nprevious day.\nCASE / GENTLE\nSeparate the key-borrowing interval from a witnessed library visit. What does\nthe photograph rule out?\nCASE / STRONGER\nCompare the afternoon-tear claim with E05 and the physical fit in E08. Then\nask who needed the audit to disappear.\n\nASHCOMBE HOUSE / CASE FILE\nSOLUTION GUIDE / SPOILERS\n03\nPUZZLE ANSWERS / SPOILERS BEGIN\nThe dispatch box opens\nTask\nAnswer\nReason\nP1\n4\nF-O-U-R, the first letters of the four lines, spells FOUR.\nP2\n1\nUnique order B-D-A-C. The second label is D, carrying 1.\nP3\n7\nThe corrected appointment is seven in the evening.\nCombine\nd\n417\nRead P1, P2, P3 in that order. Open E09.\nWhy P2 is unique: C is fourth. B must stand immediately before D. If B-D\noccupied places 2-3, A could not stand after D because place 4 is C.\nTherefore B-D occupy places 1-2 and A occupies place 3.\nP4 expected timeline: The essential interval is 9:10-9:20. Celia admits a\nvisit beginning at 9:10; nobody verifies the claimed immediate return. The\nbell and thud occur at 9:14. She is seen in the archive with the torn cuff at\n9:20.\nP5-P6: These are reasoning worksheets, not additional numeric puzzles.\nAnswers should cite evidence and distinguish corroboration from\nassumption. Accept equivalent wording.\n\nASHCOMBE HOUSE / CASE FILE\nSOLUTION GUIDE / SPOILERS\n04\nTHE ACCUSATION\nWho killed Edmund Ashcombe?\nCelia Ward caused Edmund's death. The intended private confrontation\nthreatened to expose unauthorized sales, false authority letters and the\ndiversion of 480 pounds into her private commission account.\nOpportunity: E03 puts the cupboard key in her possession at 9:10, and she\nadmits visiting Edmund. Her claim that she returned immediately to the\narchive has no witness. E12 provides a normal route to reach the archive\nwell before the 9:20 observation.\nPhysical connection: E08 records a fitted fragment from Edmund's hand\njoining Celia's damaged right cuff. E05 shows that cuff intact at 9:05, then\ntorn by 9:20. The claimed afternoon damage is false. Together, those facts\nplace the contact inside the crucial interval.\nMotive and confrontation: E06-E07 expose the false restoration story.\nE09 adds Edmund's denial of authority and his appointment with Celia\nbefore the announcement. It also explains why removing a sheet from the\nfolio failed to erase the audit.\nLikely method: During the confrontation at about 9:14, Celia struck\nEdmund with the brass bell. The interrupted ring, thud, injury and scene\nsupport this reconstruction. She left through the service passage and was\nseated in the archive by 9:20.\nWHAT MAKES THE CASE STRONG\nNeither debt, typewriter defect nor a broken alibi is enough alone. The dated\nintact cuff, physical fit, admitted meeting, false explanation and financial\nconfrontation form the supported chain.\n\nASHCOMBE HOUSE / CASE FILE\nSOLUTION GUIDE / SPOILERS\n05\nELIMINATION & FAIR ALTERNATIVES\nWhy the other five fall away\nSuspect\nPressure / reason for\nsuspicion\nWhy the case is weaker\nNora\nDebt and fear of\ndisinheritance\nMartha places her upstairs at 9:14.\nNo cloth connection.\nFelix\nThreatened professional\nreputation\nTelephone account has gaps, but no\nphysical link or contradiction\nmatching the cuff evidence.\nGideon\nQuestionable purchases\nand scandal\nInvestigator sees him in the gallery\nat the bell. His records expose the\nmoney trail.\nMartha\nProtective omission about\nNora\nCorrected account explains\nomission; upstairs with Nora. No\nmatching torn cuff.\nArthur\nCoal theft; heard service\ndoor\nHearing a door is not evidence of\nusing it. Mud is not unique; no cloth\nlink.\nThe case does not require every innocent person to have a perfect alibi. It\nrequires a supported account that explains the decisive evidence. Suspicion\nof Felix or Arthur is reasonable early on, but does not explain the fitted cloth\nand the documented false claim.\nGideon may still have professional or financial questions to answer. Clearing\na person of this killing does not certify every business decision they made.\n\nASHCOMBE HOUSE / CASE FILE\nSOLUTION GUIDE / SPOILERS\n06\nRECONSTRUCTION / FACT VERSUS INFERENCE\nThe likely final minutes\nTime\nSupported event or reconstruction\n9:05\nRecorded: Celia's cuff is intact in plate G-17.\n9:08\nRecorded: Martha puts the bell on Edmund's desk.\n9:10 onward\nRecorded: Celia borrows the key and admits visiting Edmund.\nE09 confirms the planned confrontation.\nAbout 9:14\nReconstruction: confrontation turns physical; Edmund catches\nthe cuff, tearing it. Celia uses the bell. The sound and thud\nsupport the timing.\nAfter the\nblow\nReconstruction: she tears the visible audit sheet from the folio\nand uses the service passage. No witness sees this removal or\ndeparture directly.\nBy 9:20\nRecorded: Celia is at her archive desk; her cuff is torn.\n9:22\nRecorded: she returns the cupboard key.\n9:32 onward\nRecorded: scene preserved; comparison later records the\nphysical cloth fit.\nThe exact spoken words, order of the grab and blow, and private thoughts\nare not known. Do not claim a confession or an exact medical death time.\nThe narrative solution is the best-supported reconstruction of the supplied\nevidence.\n\nASHCOMBE HOUSE / CASE FILE\nSOLUTION GUIDE / SPOILERS\n07\nEPILOGUE & SCORING\nThe truth that remained\nWhen the documents were laid in time order, Celia's neat account could no\nlonger contain them. The afternoon tear became a tear within fifteen\nminutes. The restoration fund became a private account. The vanished audit\nbecame a carbon copy inside a box.\nNora read the trust draft again, this time slowly. Martha asked whether the\nlibrary could be closed until morning. Gideon offered to supply every record\nin his office. The constable took custody of the papers, the bell and the\nfitted cloth.\nNothing in the house had required a secret passage. What had been hidden\nwas authority: who had been allowed to speak for Edmund, and how long\nthat permission could be imitated. His last unfinished announcement had\nbecome the record that outlived him.\nCase score / 10\nAward\nCulprit: Celia Ward\n2\nMotive: unauthorized sales and diverted proceeds threatened with\nexposure\n2\nMethod and route: probable bell strike; ordinary service passage\n2\nEvidence chain: E05 + E08 and E03/E09, explaining their different\nroles\n3\nReject an alternative using evidence rather than intuition\n1\n8-10: well-supported case. 5-7: right direction, missing links. 0-4: revisit claims\nversus observations. Hints do not reduce the score; reasoning matters more than\nspeed.",
      scoring: {
        maximum: 10,
        criteria: [
          { description: "Name Celia Ward", points: 2 },
          {
            description:
              "Explain unauthorized sales and diverted proceeds threatened with exposure",
            points: 2,
          },
          {
            description:
              "Explain probable bell strike and service-passage route",
            points: 2,
          },
          {
            description:
              "Link E05 and E08 with E03 or E09 and explain their different roles",
            points: 3,
          },
          { description: "Reject an alternative using evidence", points: 1 },
        ],
      },
    },

    /* ══════════════════════════════════════════════════════════════
       IMAGES
       ══════════════════════════════════════════════════════════════ */
    images: {
      cover: `${DEMO_PUBLIC_URL}/images/cover.jpg`,
      scenes: [
        {
          location: "The Library",
          url: `${DEMO_PUBLIC_URL}/images/scene-0.png`,
        },
        {
          location: "The Ballroom",
          url: `${DEMO_PUBLIC_URL}/images/scene-1.png`,
        },
        {
          location: "The Balcony",
          url: `${DEMO_PUBLIC_URL}/images/scene-2.png`,
        },
      ],
      characters: [
        {
          characterId: "C1",
          name: "Celia Ward",
          url: "/demo/images/character-C1.jpg",
        },
        {
          characterId: "C2",
          name: "Nora Ashcombe",
          url: "/demo/images/character-C2.jpg",
        },
        {
          characterId: "C3",
          name: "Dr Felix Mercer",
          url: "/demo/images/character-C3.jpg",
        },
        {
          characterId: "C4",
          name: "Gideon Pike",
          url: "/demo/images/character-C4.jpg",
        },
        {
          characterId: "C5",
          name: "Martha Reed",
          url: "/demo/images/character-C5.jpg",
        },
        {
          characterId: "C6",
          name: "Arthur Bell",
          url: "/demo/images/character-C6.jpg",
        },
      ],
    },
  };
  return data;
}

// ================================================================
// 📥 GET DEMO PDF PATH
// ================================================================
function getDemoPdfPath(kind) {
  const fileName = DEMO_PDF_FILES[kind];
  if (!fileName) return null;
  const fullPath = path.join(DEMO_PDF_ROOT, fileName);
  try {
    const stat = fs.statSync(fullPath);
    if (stat.size > 1000) {
      return { path: fullPath, fileName, size: stat.size };
    }
  } catch {
    // not found
  }
  return null;
}

// ================================================================
// 📤 EXPORTS
// ================================================================
module.exports = {
  isDemoMode,
  buildDemoMystery,
  getDemoPdfPath,
  DEMO_PDF_FILES,
  DEMO_PUBLIC_ROOT,
  DEMO_PDF_ROOT,
  DEMO_IMG_ROOT,
  DEMO_PUBLIC_URL,
};
