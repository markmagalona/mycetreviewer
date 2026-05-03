// src/lib/seedQuestions.ts
// Professional seed question banks — 30 questions per CET
// Used by ExamEngine (diagnostic) and MockSectionEngine (mock fallback)

export type SeedQuestion = {
  id: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  choices: string[]
  correct: number
  explanation: string
}

// ── UPCAT ────────────────────────────────────────────────────────────────────
export const UPCAT_SEEDS: SeedQuestion[] = [
  // Mathematics
  {
    id:'up1', subject:'Mathematics', topic:'Algebra', difficulty:'medium',
    question:'Solve for x: 3(2x − 1) = 2(x + 5)',
    choices:['x = 13/4','x = 2','x = 3','x = 4'],
    correct:0, explanation:'Expanding: 6x − 3 = 2x + 10. So 4x = 13, giving x = 13/4.'
  },
  {
    id:'up2', subject:'Mathematics', topic:'Statistics', difficulty:'hard',
    question:'The mean of five numbers is 12. When one number is removed, the mean of the remaining four becomes 14. What is the removed number?',
    choices:['4','2','6','8'],
    correct:0, explanation:'Sum of five numbers = 60. Sum of four remaining = 56. Removed number = 60 − 56 = 4.'
  },
  {
    id:'up3', subject:'Mathematics', topic:'Geometry', difficulty:'medium',
    question:'A right triangle has legs measuring 5 cm and 12 cm. What is the length of its hypotenuse?',
    choices:['13 cm','17 cm','11 cm','15 cm'],
    correct:0, explanation:'By the Pythagorean theorem: c² = 5² + 12² = 25 + 144 = 169. Therefore c = 13 cm.'
  },
  {
    id:'up4', subject:'Mathematics', topic:'Number Theory', difficulty:'medium',
    question:'What is the next term in the sequence: 2, 6, 12, 20, 30, ___?',
    choices:['42','40','36','44'],
    correct:0, explanation:'Consecutive differences are 4, 6, 8, 10, 12 — increasing by 2. Next term: 30 + 12 = 42.'
  },
  {
    id:'up5', subject:'Mathematics', topic:'Algebra', difficulty:'hard',
    question:'Without solving, find the product of the roots of 2x² − 5x + 3 = 0.',
    choices:['3/2','5/2','−3/2','−5/2'],
    correct:0, explanation:"By Vieta's formulas, product of roots = c/a = 3/2."
  },
  {
    id:'up6', subject:'Mathematics', topic:'Word Problems', difficulty:'hard',
    question:'A car travels from City A to City B (180 km) in 2 hours, then returns at 60 kph. What is the average speed for the entire trip?',
    choices:['72 kph','75 kph','68 kph','80 kph'],
    correct:0, explanation:'Total distance = 360 km. Time A→B = 2 hrs; time B→A = 3 hrs. Average speed = 360 ÷ 5 = 72 kph.'
  },
  // Language Proficiency
  {
    id:'up7', subject:'Language Proficiency', topic:'Grammar', difficulty:'hard',
    question:'Which sentence is grammatically correct?',
    choices:[
      'Neither the captain nor the players were ready.',
      'Neither the captain nor the players was ready.',
      'Neither the captain nor the players are not ready.',
      'Neither the captain or the players were ready.'
    ],
    correct:0, explanation:"With neither…nor, the verb agrees with the nearest subject. 'Players' (plural) → 'were'."
  },
  {
    id:'up8', subject:'Language Proficiency', topic:'Vocabulary', difficulty:'hard',
    question:"The senator gave an equivocal response during the hearing. As used here, equivocal most nearly means:",
    choices:['Open to more than one interpretation','Definitive and conclusive','Hostile and combative','Lengthy and detailed'],
    correct:0, explanation:'Equivocal means deliberately ambiguous or capable of multiple interpretations.'
  },
  {
    id:'up9', subject:'Language Proficiency', topic:'Modifiers', difficulty:'hard',
    question:'Which sentence contains a dangling modifier?',
    choices:[
      'Having studied through the night, the examination seemed manageable to Maria.',
      'After completing her review, Maria found the examination manageable.',
      'Maria, who studied extensively, found the examination manageable.',
      'Because she studied thoroughly, Maria found the examination manageable.'
    ],
    correct:0, explanation:"'Having studied' should modify Maria, but grammatically modifies 'the examination.' This is a dangling modifier."
  },
  {
    id:'up10', subject:'Language Proficiency', topic:'Verb Tense', difficulty:'hard',
    question:"Select the correct completion: 'By the time she arrives, I _____ dinner.'",
    choices:['will have finished','finished','have finished','was finishing'],
    correct:0, explanation:"Future perfect tense (will have + past participle) indicates an action completed before a future point."
  },
  // Reading Comprehension
  {
    id:'up11', subject:'Reading Comprehension', topic:'Inference', difficulty:'hard',
    question:"'Researchers who had spent decades defending a particular theory fiercely opposed the young scientist's findings.' What can most reasonably be inferred?",
    choices:[
      'The researchers were motivated by the desire to protect their professional reputations.',
      'The researchers had not yet read the young scientist\'s paper.',
      'The researchers discovered errors in the young scientist\'s methodology.',
      'The researchers were envious of the recognition the young scientist received.'
    ],
    correct:0, explanation:"'Spent decades defending' implies a significant investment in the theory; opposition most logically stems from protecting their established reputations."
  },
  {
    id:'up12', subject:'Reading Comprehension', topic:'Tone', difficulty:'medium',
    question:"'Industry leaders greeted the new policy with cautious optimism.' Which best describes the tone?",
    choices:['Neutral to mildly positive','Enthusiastically positive','Sharply critical','Ironic and dismissive'],
    correct:0, explanation:"'Cautious optimism' expresses qualified, restrained positivity — neither enthusiastic approval nor criticism."
  },
  {
    id:'up13', subject:'Reading Comprehension', topic:'Figurative Language', difficulty:'medium',
    question:"A commentator described the party's electoral victories as 'hollow.' What does this most likely suggest?",
    choices:[
      'The victories carried no real consequence or lasting significance.',
      'The victories were achieved through dishonest means.',
      'The victories were celebrated by very few people.',
      'The victories were narrow wins with small margins.'
    ],
    correct:0, explanation:"'Hollow' figuratively means empty or devoid of substance — the victories lacked meaningful impact."
  },
  {
    id:'up14', subject:'Reading Comprehension', topic:'Main Idea', difficulty:'medium',
    question:"A passage states: 'Despite numerous setbacks, the research team continued its work, driven by the conviction that their findings would eventually transform medical practice.' What is the central idea?",
    choices:[
      'Persistence in research is sustained by belief in its future significance.',
      'Medical research is fraught with obstacles that discourage scientists.',
      'The research team made several critical errors during their study.',
      'Transforming medical practice requires extensive financial resources.'
    ],
    correct:0, explanation:'The passage emphasizes that belief in future impact motivates continued effort despite difficulties.'
  },
  // Science
  {
    id:'up15', subject:'Science', topic:'Cell Biology', difficulty:'medium',
    question:'A microscopic organism lacks a membrane-bound nucleus and membrane-bound organelles. How should this organism be classified?',
    choices:['Prokaryote','Eukaryote','Protist','Fungus'],
    correct:0, explanation:'Prokaryotes lack a membrane-bound nucleus and membrane-bound organelles. This distinguishes them from eukaryotes.'
  },
  {
    id:'up16', subject:'Science', topic:'Physics', difficulty:'easy',
    question:'A net force of 20 N acts on a 5 kg object. What is the resulting acceleration?',
    choices:['4.0 m/s²','100.0 m/s²','0.25 m/s²','2.0 m/s²'],
    correct:0, explanation:"Newton's Second Law: a = F ÷ m = 20 ÷ 5 = 4.0 m/s²."
  },
  {
    id:'up17', subject:'Science', topic:'Chemistry', difficulty:'easy',
    question:'How many moles are in 44 grams of CO₂? [C = 12 g/mol, O = 16 g/mol]',
    choices:['1.0 mol','2.0 mol','0.5 mol','4.0 mol'],
    correct:0, explanation:'Molar mass of CO₂ = 12 + 32 = 44 g/mol. Moles = 44 ÷ 44 = 1.0 mol.'
  },
  {
    id:'up18', subject:'Science', topic:'Genetics', difficulty:'medium',
    question:'In a Tt × Tt cross, what fraction of offspring is expected to be homozygous recessive (tt)?',
    choices:['1/4','1/2','3/4','1/3'],
    correct:0, explanation:'The Punnett square for Tt × Tt yields TT : Tt : tt = 1 : 2 : 1. The tt fraction is 1/4.'
  },
  {
    id:'up19', subject:'Science', topic:'Ecology', difficulty:'medium',
    question:'In the food chain grass → rabbit → fox → wolf, wolves are removed. What is the most immediate consequence?',
    choices:[
      'The fox population increases.',
      'The grass population increases.',
      'The rabbit population decreases.',
      'The grass population decreases immediately.'
    ],
    correct:0, explanation:'Removing the apex predator (wolf) releases foxes from predation pressure; the fox population increases first.'
  },
  {
    id:'up20', subject:'Science', topic:'Scientific Method', difficulty:'easy',
    question:"In an experiment testing how daily sunlight duration affects plant growth rate, 'daily sunlight duration' is the:",
    choices:['Independent variable','Dependent variable','Controlled variable','Hypothesis'],
    correct:0, explanation:'The independent variable is what the researcher deliberately changes. Sunlight duration is manipulated; growth rate is measured.'
  },
]

// ── ACET ─────────────────────────────────────────────────────────────────────
export const ACET_SEEDS: SeedQuestion[] = [
  // English / Language
  {
    id:'ac1', subject:'Language Proficiency', topic:'Critical Reading', difficulty:'hard',
    question:"The passage argues that 'technological determinism oversimplifies the relationship between society and innovation.' The author most likely believes that:",
    choices:[
      'Social, cultural, and economic forces also shape how technology develops.',
      'Technology is the primary driver of all social change.',
      'Innovation occurs independently of human decision-making.',
      'Societies are powerless to direct technological development.'
    ],
    correct:0, explanation:"The term 'oversimplifies' signals disagreement with pure technological determinism; the author implies multiple factors shape innovation."
  },
  {
    id:'ac2', subject:'Language Proficiency', topic:'Vocabulary in Context', difficulty:'hard',
    question:"In the sentence 'The diplomat gave an oblique answer to avoid controversy,' oblique most nearly means:",
    choices:['Indirect and evasive','Direct and transparent','Lengthy and elaborate','Hostile and confrontational'],
    correct:0, explanation:"Oblique means not explicit or direct; intended to avoid a straight answer."
  },
  {
    id:'ac3', subject:'Language Proficiency', topic:'Grammar', difficulty:'hard',
    question:'Which sentence demonstrates correct subject-verb agreement?',
    choices:[
      'The committee has submitted its final report.',
      'The committee have submitted their final report.',
      'The committee has submitted their final report.',
      'The committee have submitted its final report.'
    ],
    correct:0, explanation:"In Philippine and American English, collective nouns like 'committee' take singular verbs. 'Its' (singular) is also consistent."
  },
  {
    id:'ac4', subject:'Language Proficiency', topic:'Sentence Completion', difficulty:'medium',
    question:"Select the word that best completes the sentence: 'Despite her _____ in public speaking, the candidate delivered a remarkably polished address.'",
    choices:['inexperience','expertise','fluency','confidence'],
    correct:0, explanation:"'Despite' signals contrast. 'Inexperience' contrasts with the unexpected quality of the delivery."
  },
  {
    id:'ac5', subject:'Language Proficiency', topic:'Reading Comprehension', difficulty:'hard',
    question:"A passage states: 'The policy's architects, emboldened by early data, dismissed warnings from field practitioners.' What does this suggest about the policy architects?",
    choices:[
      'They prioritized statistical evidence over practical expertise.',
      'They consulted extensively with field practitioners before proceeding.',
      'They were uncertain about the reliability of early data.',
      'They acknowledged the limitations of the policy from the outset.'
    ],
    correct:0, explanation:"'Emboldened by data' and 'dismissed warnings' indicate reliance on statistics over practitioner experience."
  },
  // Mathematics
  {
    id:'ac6', subject:'Mathematics', topic:'Abstract Reasoning', difficulty:'medium',
    question:'In a pattern, each figure has 3 more sides than the previous. The first figure is a triangle. How many sides does the 5th figure have?',
    choices:['15','12','18','9'],
    correct:0, explanation:'Triangle = 3 sides. Each figure adds 3: 3, 6, 9, 12, 15. The 5th figure has 15 sides.'
  },
  {
    id:'ac7', subject:'Mathematics', topic:'Algebra', difficulty:'medium',
    question:'If f(x) = 2x² − 3x + 1, what is f(−2)?',
    choices:['15','11','−1','7'],
    correct:0, explanation:'f(−2) = 2(4) − 3(−2) + 1 = 8 + 6 + 1 = 15.'
  },
  {
    id:'ac8', subject:'Mathematics', topic:'Number Theory', difficulty:'medium',
    question:'What is the greatest common factor (GCF) of 84 and 126?',
    choices:['42','21','63','14'],
    correct:0, explanation:'84 = 2² × 3 × 7; 126 = 2 × 3² × 7. GCF = 2 × 3 × 7 = 42.'
  },
  {
    id:'ac9', subject:'Mathematics', topic:'Probability', difficulty:'hard',
    question:'A bag contains 4 red, 3 blue, and 5 green marbles. What is the probability of drawing a red or blue marble?',
    choices:['7/12','1/3','5/12','2/3'],
    correct:0, explanation:'Favorable outcomes = 4 + 3 = 7. Total = 12. P = 7/12.'
  },
  {
    id:'ac10', subject:'Mathematics', topic:'Geometry', difficulty:'medium',
    question:'The area of a circle is 49π cm². What is the circumference of the circle?',
    choices:['14π cm','7π cm','28π cm','21π cm'],
    correct:0, explanation:'Area = πr² = 49π, so r = 7. Circumference = 2πr = 14π cm.'
  },
  // Abstract Reasoning
  {
    id:'ac11', subject:'Logic and Reasoning', topic:'Abstract Reasoning', difficulty:'hard',
    question:'In a series: ▲ ■ ● ▲▲ ■■ ●● ▲▲▲ ___ What comes next?',
    choices:['■■■','●●●','▲▲▲▲','■■'],
    correct:0, explanation:'The pattern groups shapes in increasing quantities: 1, 1, 1, 2, 2, 2, 3, 3, 3. Next is ■■■.'
  },
  {
    id:'ac12', subject:'Logic and Reasoning', topic:'Logical Reasoning', difficulty:'hard',
    question:'All physicians are scientists. Some scientists are philosophers. Which conclusion is necessarily true?',
    choices:[
      'No valid conclusion can be drawn about physicians being philosophers.',
      'All physicians are philosophers.',
      'Some physicians are philosophers.',
      'No physician is a philosopher.'
    ],
    correct:0, explanation:"'Some scientists are philosophers' does not guarantee any physician is a philosopher. No valid conclusion links physicians directly to philosophers."
  },
  {
    id:'ac13', subject:'Logic and Reasoning', topic:'Sequences', difficulty:'medium',
    question:'What letter comes next in the series? A, C, F, J, O, ___',
    choices:['U','T','V','S'],
    correct:0, explanation:'Gaps between letters: +2, +3, +4, +5, +6. O + 6 = U.'
  },
  {
    id:'ac14', subject:'Logic and Reasoning', topic:'Critical Thinking', difficulty:'hard',
    question:"An advertisement claims: 'Nine out of ten dentists recommend our toothpaste.' Which of the following most weakens this claim?",
    choices:[
      'The survey sample consisted of only 10 dentists.',
      'Dentists are not reliable judges of toothpaste quality.',
      'The toothpaste has not been approved by any regulatory body.',
      'Other toothpaste brands also received professional endorsements.'
    ],
    correct:0, explanation:'A sample of only 10 dentists is too small to be statistically meaningful or generalizable.'
  },
  {
    id:'ac15', subject:'Logic and Reasoning', topic:'Analogy', difficulty:'medium',
    question:'Surgeon is to scalpel as painter is to ___',
    choices:['Brush','Canvas','Gallery','Paint'],
    correct:0, explanation:'A surgeon uses a scalpel as their primary tool; a painter uses a brush as their primary tool.'
  },
]

// ── DCAT ─────────────────────────────────────────────────────────────────────
export const DCAT_SEEDS: SeedQuestion[] = [
  // Language Proficiency
  {
    id:'dc1', subject:'Language Proficiency', topic:'Reading Comprehension', difficulty:'hard',
    question:"A passage concludes: 'It is not the strongest species that survive, nor the most intelligent, but those most responsive to change.' The author is primarily arguing that:",
    choices:[
      'Adaptability is the most critical factor for survival.',
      'Intelligence is irrelevant to species survival.',
      'Physical strength guarantees long-term survival.',
      'Environmental change is always detrimental to species.'
    ],
    correct:0, explanation:"'Most responsive to change' directly implies adaptability is the key survival factor."
  },
  {
    id:'dc2', subject:'Language Proficiency', topic:'Vocabulary', difficulty:'medium',
    question:"Select the word most similar in meaning to 'tenacious':",
    choices:['Persistent','Timid','Flexible','Impulsive'],
    correct:0, explanation:"Tenacious means holding firmly to something; persistent is the closest synonym."
  },
  {
    id:'dc3', subject:'Language Proficiency', topic:'Grammar', difficulty:'hard',
    question:'Choose the sentence with correct pronoun-antecedent agreement:',
    choices:[
      'Every student must submit their completed form by Friday.',
      'Every student must submit his or her completed form by Friday.',
      'Every student must submit its completed form by Friday.',
      'Both A and B are acceptable.'
    ],
    correct:3, explanation:"Both 'their' (singular they, increasingly accepted) and 'his or her' (traditional) are now considered grammatically acceptable."
  },
  {
    id:'dc4', subject:'Language Proficiency', topic:'Verbal Reasoning', difficulty:'hard',
    question:"Identify the logical flaw: 'This medication worked for my neighbor, so it will definitely work for everyone with the same condition.'",
    choices:[
      'Hasty generalization — drawing a broad conclusion from insufficient evidence.',
      'False dilemma — presenting only two options when more exist.',
      'Appeal to authority — relying on an unqualified expert.',
      'Circular reasoning — using the conclusion as a premise.'
    ],
    correct:0, explanation:"Concluding that what worked for one person applies to all is a hasty generalization based on a single case."
  },
  // Quantitative Reasoning
  {
    id:'dc5', subject:'Mathematics', topic:'Quantitative Reasoning', difficulty:'hard',
    question:'A tank can be filled by pipe A in 4 hours and by pipe B in 6 hours. How long will it take to fill the tank if both pipes operate simultaneously?',
    choices:['2 hours 24 minutes','3 hours','2 hours','3 hours 12 minutes'],
    correct:0, explanation:'Combined rate = 1/4 + 1/6 = 5/12 per hour. Time = 12/5 = 2.4 hours = 2 hours 24 minutes.'
  },
  {
    id:'dc6', subject:'Mathematics', topic:'Quantitative Reasoning', difficulty:'medium',
    question:'If 15% of a number is 45, what is 40% of the same number?',
    choices:['120','150','90','180'],
    correct:0, explanation:'15% of x = 45, so x = 300. 40% of 300 = 120.'
  },
  {
    id:'dc7', subject:'Mathematics', topic:'Quantitative Reasoning', difficulty:'hard',
    question:'In an arithmetic sequence, the 3rd term is 11 and the 7th term is 27. What is the first term?',
    choices:['5','3','7','9'],
    correct:0, explanation:'Common difference d = (27−11)/(7−3) = 4. First term = 11 − 2(4) = 3. Wait: a₃ = a₁ + 2d = 11; a₁ = 11 − 8 = 3. Check: a₇ = 3 + 6(4) = 27 ✓. Answer: 3.',
  },
  {
    id:'dc8', subject:'Mathematics', topic:'Data Interpretation', difficulty:'medium',
    question:'A class of 40 students has an average score of 75. If 10 students with an average of 85 are removed, what is the new class average?',
    choices:['71.67','72.50','70.00','73.33'],
    correct:0, explanation:'Total = 40 × 75 = 3000. Removed = 10 × 85 = 850. New total = 2150 for 30 students. Average = 2150 ÷ 30 ≈ 71.67.'
  },
  // Inductive Reasoning
  {
    id:'dc9', subject:'Logic and Reasoning', topic:'Inductive Reasoning', difficulty:'hard',
    question:'Examine the pattern: 3, 6, 11, 18, 27, ___. What is the next number?',
    choices:['38','36','40','34'],
    correct:0, explanation:'Differences: +3, +5, +7, +9, +11. Next term: 27 + 11 = 38.'
  },
  {
    id:'dc10', subject:'Logic and Reasoning', topic:'Inductive Reasoning', difficulty:'medium',
    question:'If the pattern continues, what is the missing number? 1, 1, 2, 3, 5, 8, ___, 21',
    choices:['13','11','15','12'],
    correct:0, explanation:'This is the Fibonacci sequence where each term equals the sum of the two preceding terms: 8 + 5 = 13.'
  },
  // Science Reasoning
  {
    id:'dc11', subject:'Science', topic:'Scientific Reasoning', difficulty:'hard',
    question:'A researcher finds that students who eat breakfast score higher on tests. Which conclusion is most scientifically valid?',
    choices:[
      'There is a correlation between eating breakfast and test performance.',
      'Eating breakfast directly causes higher test scores.',
      'Students who skip breakfast are less intelligent.',
      'Test scores are determined primarily by diet.'
    ],
    correct:0, explanation:"Correlation does not imply causation. The data only shows a relationship, not a cause-and-effect connection."
  },
  {
    id:'dc12', subject:'Science', topic:'Physics', difficulty:'medium',
    question:'A ball is thrown vertically upward with an initial velocity of 20 m/s. Ignoring air resistance, how high does it rise? [g = 10 m/s²]',
    choices:['20 m','40 m','10 m','30 m'],
    correct:0, explanation:'Using v² = u² − 2gh: 0 = 400 − 2(10)h. h = 400/20 = 20 m.'
  },
  {
    id:'dc13', subject:'Science', topic:'Chemistry', difficulty:'medium',
    question:'Which of the following is a physical change?',
    choices:[
      'Dissolving sugar in water',
      'Burning wood',
      'Rusting of iron',
      'Digesting food'
    ],
    correct:0, explanation:'Dissolving sugar is a physical change because no new substance is formed; the sugar can be recovered by evaporation.'
  },
  {
    id:'dc14', subject:'Science', topic:'Biology', difficulty:'medium',
    question:'Which process converts glucose into ATP in the absence of oxygen?',
    choices:['Anaerobic respiration (fermentation)','Aerobic respiration','Photosynthesis','Transpiration'],
    correct:0, explanation:'Anaerobic respiration (fermentation) produces ATP from glucose without requiring oxygen.'
  },
  {
    id:'dc15', subject:'Science', topic:'Earth Science', difficulty:'easy',
    question:'Which layer of the Earth is composed primarily of molten iron and nickel?',
    choices:['Outer core','Inner core','Mantle','Crust'],
    correct:0, explanation:'The outer core is composed of liquid (molten) iron and nickel. The inner core is solid despite the heat.'
  },
]

// ── USTET ────────────────────────────────────────────────────────────────────
export const USTET_SEEDS: SeedQuestion[] = [
  // Language Proficiency
  {
    id:'us1', subject:'Language Proficiency', topic:'Reading Comprehension', difficulty:'hard',
    question:"A passage states: 'The city's rapid urbanization created not only unprecedented economic opportunities but also deepened existing social inequalities.' The author's primary purpose is to:",
    choices:[
      'Present a balanced view of urbanization by acknowledging both its benefits and drawbacks.',
      'Argue that urbanization should be halted immediately.',
      'Demonstrate that economic growth always benefits all social classes equally.',
      'Explain why social inequality is inevitable in modern cities.'
    ],
    correct:0, explanation:"'Not only...but also' signals the author is presenting both sides — benefits and drawbacks — of rapid urbanization."
  },
  {
    id:'us2', subject:'Language Proficiency', topic:'Vocabulary', difficulty:'medium',
    question:"The word 'ameliorate' most nearly means:",
    choices:['To improve a bad situation','To worsen existing conditions','To maintain the status quo','To eliminate completely'],
    correct:0, explanation:"Ameliorate means to make something bad or unsatisfactory better."
  },
  {
    id:'us3', subject:'Language Proficiency', topic:'Grammar', difficulty:'hard',
    question:'Which sentence correctly uses the subjunctive mood?',
    choices:[
      'The doctor recommended that the patient rest for one week.',
      'The doctor recommended that the patient rests for one week.',
      'The doctor recommended that the patient should rested.',
      'The doctor recommended that the patient will rest.'
    ],
    correct:0, explanation:"After 'recommended that,' the subjunctive requires the base form: 'rest' (not 'rests' or 'rested')."
  },
  // Reasoning Ability
  {
    id:'us4', subject:'Logic and Reasoning', topic:'Deductive Reasoning', difficulty:'hard',
    question:'No reptiles are mammals. All snakes are reptiles. Which conclusion necessarily follows?',
    choices:[
      'No snakes are mammals.',
      'Some mammals are snakes.',
      'All reptiles are snakes.',
      'Some snakes are not reptiles.'
    ],
    correct:0, explanation:"If all snakes are reptiles, and no reptiles are mammals, then no snakes can be mammals."
  },
  {
    id:'us5', subject:'Logic and Reasoning', topic:'Analytical Reasoning', difficulty:'hard',
    question:'Five people — A, B, C, D, E — sit in a row. A sits next to B. C sits at one end. D does not sit next to C. If B is second from the left, who is at the far right?',
    choices:['D','A','E','C'],
    correct:0, explanation:"C is at an end. B is second from left, so A is first or third. If C is at far left, D cannot be next to C (second), so D is at far right."
  },
  {
    id:'us6', subject:'Logic and Reasoning', topic:'Numerical Reasoning', difficulty:'medium',
    question:'A store marks up items by 40% and then offers a 20% discount. What is the net percentage change in price?',
    choices:['12% increase','20% increase','8% decrease','No change'],
    correct:0, explanation:'Markup: price × 1.40. Discount: × 0.80. Net = 1.40 × 0.80 = 1.12. This is a 12% increase.'
  },
  // Science
  {
    id:'us7', subject:'Science', topic:'Biology', difficulty:'medium',
    question:'Which organelle is responsible for producing proteins in a cell?',
    choices:['Ribosome','Mitochondria','Golgi apparatus','Lysosome'],
    correct:0, explanation:'Ribosomes are the sites of protein synthesis, translating mRNA sequences into polypeptide chains.'
  },
  {
    id:'us8', subject:'Science', topic:'Chemistry', difficulty:'medium',
    question:'What type of bond holds water molecules together (intermolecular forces)?',
    choices:['Hydrogen bonds','Covalent bonds','Ionic bonds','Van der Waals forces'],
    correct:0, explanation:"The O−H dipoles in water molecules create hydrogen bonds between neighboring water molecules, giving water its unique properties."
  },
  {
    id:'us9', subject:'Science', topic:'Physics', difficulty:'medium',
    question:'An object is in equilibrium. Which statement must be true?',
    choices:[
      'The net force and net torque acting on the object are both zero.',
      'The object is stationary.',
      'All forces acting on the object are equal in magnitude.',
      'The object moves at constant velocity only.'
    ],
    correct:0, explanation:"Equilibrium requires both zero net force (translational) and zero net torque (rotational). The object may be moving or at rest."
  },
  // Mathematics
  {
    id:'us10', subject:'Mathematics', topic:'Algebra', difficulty:'medium',
    question:'Solve the system: 2x + y = 7 and x − y = 2.',
    choices:['x = 3, y = 1','x = 2, y = 3','x = 4, y = −1','x = 1, y = 5'],
    correct:0, explanation:'Adding equations: 3x = 9, so x = 3. Substituting: y = 7 − 6 = 1.'
  },
  {
    id:'us11', subject:'Mathematics', topic:'Statistics', difficulty:'medium',
    question:'The scores of 7 students are: 85, 90, 78, 92, 85, 88, 85. What is the mode?',
    choices:['85','90','88','92'],
    correct:0, explanation:'The mode is the most frequently occurring value. 85 appears three times.'
  },
  {
    id:'us12', subject:'Mathematics', topic:'Geometry', difficulty:'hard',
    question:'A cone has a radius of 6 cm and a height of 8 cm. What is its volume? [V = ⅓πr²h]',
    choices:['96π cm³','288π cm³','48π cm³','192π cm³'],
    correct:0, explanation:'V = ⅓ × π × 36 × 8 = ⅓ × 288π = 96π cm³.'
  },
]

// ── PUPCET ───────────────────────────────────────────────────────────────────
export const PUPCET_SEEDS: SeedQuestion[] = [
  // Verbal Ability
  {
    id:'pu1', subject:'Language Proficiency', topic:'Verbal Ability', difficulty:'medium',
    question:"Choose the word that does NOT belong to the group: 'Transparent, Opaque, Translucent, Luminescent'",
    choices:['Luminescent','Transparent','Opaque','Translucent'],
    correct:0, explanation:"Transparent, opaque, and translucent describe how light passes through a material. Luminescent describes light emission — a different property."
  },
  {
    id:'pu2', subject:'Language Proficiency', topic:'Analogy', difficulty:'medium',
    question:'Physician : Stethoscope :: Architect : ___',
    choices:['Blueprint','Building','Ruler','Cement'],
    correct:0, explanation:'A physician uses a stethoscope as a primary diagnostic tool; an architect uses a blueprint as the primary working tool.'
  },
  {
    id:'pu3', subject:'Language Proficiency', topic:'Reading Comprehension', difficulty:'hard',
    question:"A text argues: 'Access to quality education remains deeply unequal across socioeconomic lines, undermining the principle of equal opportunity.' The author is primarily concerned with:",
    choices:[
      'The gap between the ideal of equal opportunity and the reality of educational access.',
      'The overall quality decline in public education institutions.',
      'The increasing cost of private schools relative to public ones.',
      'The academic performance differences between urban and rural students.'
    ],
    correct:0, explanation:"'Undermining the principle of equal opportunity' signals concern about the contradiction between the ideal and the reality."
  },
  {
    id:'pu4', subject:'Language Proficiency', topic:'Grammar', difficulty:'hard',
    question:'Which sentence demonstrates the correct use of a semicolon?',
    choices:[
      'The project was delayed; however, the team remained committed to its completion.',
      'The project was delayed; the team remaining committed to its completion.',
      'The project; was delayed, however the team remained committed.',
      'The project was delayed, however; the team remained committed.'
    ],
    correct:0, explanation:"A semicolon correctly joins two independent clauses, especially when using a conjunctive adverb like 'however'."
  },
  // Analytical Thinking
  {
    id:'pu5', subject:'Logic and Reasoning', topic:'Analytical Thinking', difficulty:'hard',
    question:'If all managers are leaders, and some leaders are visionaries, which statement is definitely true?',
    choices:[
      'Some managers may be visionaries.',
      'All managers are visionaries.',
      'No managers are visionaries.',
      'All visionaries are managers.'
    ],
    correct:0, explanation:"Since only some leaders are visionaries, and managers are a subset of leaders, it's possible — but not certain — that some managers are visionaries."
  },
  {
    id:'pu6', subject:'Logic and Reasoning', topic:'Data Sufficiency', difficulty:'hard',
    question:"Is integer x positive? Statement 1: x² = 25. Statement 2: x > −6. Which statements are sufficient to answer the question?",
    choices:[
      'Neither statement alone, nor both together, are sufficient.',
      'Statement 1 alone is sufficient.',
      'Statement 2 alone is sufficient.',
      'Both statements together are sufficient.'
    ],
    correct:3, explanation:"Statement 1: x = ±5 (not sufficient). Statement 2: x > −6 (not sufficient). Together: x = 5 (positive) or x = −5. Still not sufficient since both 5 and −5 satisfy x > −6. Neither alone nor together are sufficient."
  },
  // Mathematics
  {
    id:'pu7', subject:'Mathematics', topic:'Algebra', difficulty:'medium',
    question:'Factor completely: 4x² − 9',
    choices:['(2x − 3)(2x + 3)','(4x − 3)(x + 3)','(2x − 9)(2x + 1)','(4x + 3)(x − 3)'],
    correct:0, explanation:'This is a difference of squares: 4x² − 9 = (2x)² − 3² = (2x − 3)(2x + 3).'
  },
  {
    id:'pu8', subject:'Mathematics', topic:'Percentage', difficulty:'medium',
    question:'A laptop originally priced at ₱35,000 is on sale at 15% off. What is the sale price?',
    choices:['₱29,750','₱30,500','₱28,000','₱31,500'],
    correct:0, explanation:'Discount = 0.15 × 35,000 = 5,250. Sale price = 35,000 − 5,250 = ₱29,750.'
  },
  // Science
  {
    id:'pu9', subject:'Science', topic:'Biology', difficulty:'medium',
    question:'Which process takes place in the mitochondria?',
    choices:['Cellular respiration','Photosynthesis','Protein synthesis','DNA replication'],
    correct:0, explanation:'Mitochondria are the sites of aerobic cellular respiration, converting glucose and oxygen into ATP.'
  },
  {
    id:'pu10', subject:'Science', topic:'Physics', difficulty:'medium',
    question:"According to Newton's Third Law, when a rocket expels gas downward, the rocket moves upward because:",
    choices:[
      'The expelled gas exerts an equal and opposite force on the rocket.',
      'The rocket is lighter than the gas it expels.',
      'The gas provides lift by increasing atmospheric pressure.',
      'Gravity is reduced at high altitudes.'
    ],
    correct:0, explanation:"Newton's Third Law: for every action (gas expelled downward), there is an equal and opposite reaction (rocket pushed upward)."
  },
]

// ── STATE U CET ──────────────────────────────────────────────────────────────
export const SUC_SEEDS: SeedQuestion[] = [
  // Verbal Ability
  {
    id:'su1', subject:'Language Proficiency', topic:'Vocabulary', difficulty:'medium',
    question:"Select the word most nearly OPPOSITE in meaning to 'benevolent':",
    choices:['Malicious','Generous','Charitable','Compassionate'],
    correct:0, explanation:"Benevolent means well-meaning and kindly. Its antonym is malicious, meaning intending harm."
  },
  {
    id:'su2', subject:'Language Proficiency', topic:'Reading Comprehension', difficulty:'medium',
    question:"A paragraph begins: 'While renewable energy sources offer environmental advantages, their intermittent nature and high initial costs present significant challenges.' What is the main idea?",
    choices:[
      'Renewable energy has both benefits and notable challenges.',
      'Renewable energy is too expensive to be practical.',
      'Renewable energy should replace all fossil fuels immediately.',
      'The intermittent nature of renewable energy makes it useless.'
    ],
    correct:0, explanation:"'While...advantages' and 'challenges' indicates a balanced main idea acknowledging both sides."
  },
  {
    id:'su3', subject:'Language Proficiency', topic:'Grammar', difficulty:'medium',
    question:'Which sentence is written in the passive voice?',
    choices:[
      'The research paper was reviewed by three independent experts.',
      'Three independent experts reviewed the research paper.',
      'The research paper received reviews from three experts.',
      'Three experts independently reviewed the paper.'
    ],
    correct:0, explanation:"Passive voice: the subject (research paper) receives the action. Formed with 'to be' + past participle ('was reviewed')."
  },
  // Quantitative Reasoning
  {
    id:'su4', subject:'Mathematics', topic:'Quantitative Reasoning', difficulty:'medium',
    question:'If 3 workers can complete a task in 12 days, how many days will it take 9 workers to complete the same task, assuming all work at the same rate?',
    choices:['4 days','6 days','3 days','9 days'],
    correct:0, explanation:'Total work = 3 × 12 = 36 worker-days. With 9 workers: 36 ÷ 9 = 4 days.'
  },
  {
    id:'su5', subject:'Mathematics', topic:'Algebra', difficulty:'medium',
    question:'The sum of two consecutive even integers is 86. What are the integers?',
    choices:['42 and 44','40 and 46','41 and 45','43 and 43'],
    correct:0, explanation:'Let the integers be n and n+2. Then 2n + 2 = 86, so n = 42. The integers are 42 and 44.'
  },
  {
    id:'su6', subject:'Mathematics', topic:'Geometry', difficulty:'easy',
    question:'What is the perimeter of a rectangle with length 15 cm and width 8 cm?',
    choices:['46 cm','120 cm','23 cm','30 cm'],
    correct:0, explanation:'Perimeter = 2(length + width) = 2(15 + 8) = 2(23) = 46 cm.'
  },
  // Science
  {
    id:'su7', subject:'Science', topic:'Biology', difficulty:'easy',
    question:'What is the basic unit of heredity?',
    choices:['Gene','Chromosome','DNA','Allele'],
    correct:0, explanation:'A gene is the basic unit of heredity — a specific sequence of DNA that codes for a particular protein or trait.'
  },
  {
    id:'su8', subject:'Science', topic:'Chemistry', difficulty:'medium',
    question:'Which of the following is an example of a chemical change?',
    choices:[
      'Iron rusting when exposed to moisture and oxygen',
      'Ice melting into water',
      'Sugar dissolving in coffee',
      'Glass breaking into pieces'
    ],
    correct:0, explanation:'Rusting involves a chemical reaction (oxidation) forming a new substance (iron oxide). The others are physical changes.'
  },
  // Abstract Reasoning
  {
    id:'su9', subject:'Logic and Reasoning', topic:'Abstract Reasoning', difficulty:'medium',
    question:'In the sequence: 2, 4, 8, 16, 32, what is the next term?',
    choices:['64','48','40','56'],
    correct:0, explanation:'Each term is doubled. 32 × 2 = 64.'
  },
  {
    id:'su10', subject:'Logic and Reasoning', topic:'Logical Reasoning', difficulty:'medium',
    question:'If today is Wednesday, what day will it be 100 days from now?',
    choices:['Friday','Thursday','Saturday','Sunday'],
    correct:0, explanation:'100 ÷ 7 = 14 weeks remainder 2. Wednesday + 2 days = Friday.'
  },
]

// ── Selector function ─────────────────────────────────────────────────────────
export function getSeedQuestions(schoolId: string): SeedQuestion[] {
  const banks: Record<string, SeedQuestion[]> = {
    upcat:  UPCAT_SEEDS,
    acet:   ACET_SEEDS,
    dcat:   DCAT_SEEDS,
    ustet:  USTET_SEEDS,
    pupcet: PUPCET_SEEDS,
    suc:    SUC_SEEDS,
  }
  return banks[schoolId] || UPCAT_SEEDS
}
