-- WhyWrong AI | Seed: subjects, topics, starter misconception packs, probes, sample questions
-- All misconceptions are well-documented patterns in education research. teacher_reviewed stays 0
-- until a subject teacher signs off, and the UI shows "Awaiting subject-teacher review".
SET NAMES utf8mb4;

INSERT INTO subjects (slug,name,category,description,icon,color_hex,sort_order) VALUES
('mathematics','Mathematics','stem','From basic arithmetic to calculus','sigma','#D9C2FC',1),
('physics','Physics','stem','Forces, energy, motion and more','atom','#DCEBFF',2),
('computing','Computing','stem','Algorithms, programming, logic','code','#D4FBE9',3),
('chemistry','Chemistry','stem','Atoms, reactions, chemical bonds','flask','#FDDFE6',4),
('biology','Biology','stem','Cells, organisms, human body','leaf','#E3F7E0',5),
('english','English','general','Grammar, comprehension, writing','book-open','#FEEACC',6),
('geography','Geography','general','Maps, environment, people','globe','#E2F1FE',7),
('economics','Economics','general','Markets, resources, development','bar-chart','#FEF5D7',8),
('health-science','Health Science','general','Wellness, diseases, healthcare','heart','#ECE0FC',9);

INSERT INTO topics (subject_id,slug,name,sort_order) VALUES
((SELECT id FROM subjects WHERE slug='mathematics'),'fractions','Fractions',1),
((SELECT id FROM subjects WHERE slug='mathematics'),'decimals','Decimals',2),
((SELECT id FROM subjects WHERE slug='mathematics'),'operations','Operations',3),
((SELECT id FROM subjects WHERE slug='mathematics'),'negative-numbers','Negative numbers',4),
((SELECT id FROM subjects WHERE slug='mathematics'),'algebra','Algebra',5),
((SELECT id FROM subjects WHERE slug='physics'),'motion','Motion and forces',1),
((SELECT id FROM subjects WHERE slug='physics'),'electricity','Electricity',2),
((SELECT id FROM subjects WHERE slug='physics'),'heat','Heat and temperature',3),
((SELECT id FROM subjects WHERE slug='computing'),'variables','Variables and assignment',1),
((SELECT id FROM subjects WHERE slug='computing'),'control','Conditions and equality',2),
((SELECT id FROM subjects WHERE slug='computing'),'data-structures','Lists and indexing',3);

INSERT INTO concept_edges (topic_id,prerequisite_topic_id) VALUES
((SELECT id FROM topics WHERE slug='fractions'),(SELECT id FROM topics WHERE slug='operations')),
((SELECT id FROM topics WHERE slug='decimals'),(SELECT id FROM topics WHERE slug='fractions')),
((SELECT id FROM topics WHERE slug='algebra'),(SELECT id FROM topics WHERE slug='negative-numbers'));

INSERT INTO pack_versions (subject_id,version,status,notes) VALUES
((SELECT id FROM subjects WHERE slug='mathematics'),'0.1','published','Starter pack, awaiting subject-teacher review'),
((SELECT id FROM subjects WHERE slug='physics'),'0.1','published','Starter pack, awaiting subject-teacher review'),
((SELECT id FROM subjects WHERE slug='computing'),'0.1','published','Starter pack, awaiting subject-teacher review');

-- helper pattern: code, topic slug, pack subject slug, label, belief, description, why true, example wrong
INSERT INTO misconceptions (code,topic_id,pack_version_id,label,student_belief,description,why_it_feels_true,example_wrong,detector_type,detector_json,prior_weight,verified_status) VALUES
('MATH-FRAC-001',(SELECT id FROM topics WHERE slug='fractions'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Adds tops and bottoms separately','To add fractions, add the numerators and add the denominators.','The learner treats a fraction as two separate whole numbers and adds each part.','It works for whole numbers, so it feels like the same rule.','1/3 + 1/4 = 2/7','pattern','{"op":"add_fraction","rule":"num_sum_over_den_sum"}',0.400,'verified'),
('MATH-FRAC-002',(SELECT id FROM topics WHERE slug='fractions'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Bigger denominator means bigger fraction','1/8 is bigger than 1/4 because 8 is bigger than 4.','The learner compares the denominators as whole numbers.','Bigger numbers usually mean bigger amounts.','1/8 > 1/4','distractor',NULL,0.300,'verified'),
('MATH-DEC-001',(SELECT id FROM topics WHERE slug='decimals'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Longer decimal is larger','0.35 is bigger than 0.5 because 35 is bigger than 5.','The learner ignores place value and reads the digits after the point as a whole number.','Whole-number comparison rules feel natural.','0.35 > 0.5','distractor',NULL,0.300,'verified'),
('MATH-OPS-001',(SELECT id FROM topics WHERE slug='operations'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Multiplication always makes bigger','Multiplying always gives a bigger number.','The learner generalises from whole-number multiplication to all numbers.','It is true for whole numbers greater than 1.','8 x 0.5 > 8','distractor',NULL,0.300,'verified'),
('MATH-OPS-002',(SELECT id FROM topics WHERE slug='operations'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Division always makes smaller','Dividing always gives a smaller number.','The learner generalises from sharing whole numbers to all divisors.','Sharing into groups makes each share smaller.','6 / 0.5 < 6','distractor',NULL,0.300,'verified'),
('MATH-NEG-001',(SELECT id FROM topics WHERE slug='negative-numbers'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Subtracts smaller from larger','Always take the smaller number from the larger one.','The learner reverses the order so the answer stays positive.','Earlier lessons only used cases where the answer was positive.','3 - 5 = 2','pattern','{"op":"subtract","rule":"abs_difference"}',0.350,'verified'),
('MATH-ALG-001',(SELECT id FROM topics WHERE slug='algebra'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Combines unlike terms','3x + 2 = 5x, because you can add the numbers and the x together.','The learner merges terms that are not alike.','It looks like normal addition of the numbers.','3x + 2 = 5x','pattern','{"op":"combine_terms","rule":"unlike_terms_merged"}',0.350,'verified'),
('MATH-ALG-002',(SELECT id FROM topics WHERE slug='algebra'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='mathematics')),'Squaring a bracket squares each term only','(a + b)^2 = a^2 + b^2','The learner distributes the square over addition as if it were multiplication.','Distribution works for 2(a + b).','(a+b)^2 = a^2 + b^2','pattern','{"op":"square_binomial","rule":"no_cross_term"}',0.350,'verified'),
('PHY-MOT-001',(SELECT id FROM topics WHERE slug='motion'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='physics')),'Heavier objects fall faster','A heavier object falls faster than a lighter one.','The learner relies on everyday experience with air resistance.','A stone falls faster than a feather in daily life.','5 kg lands before 1 kg','distractor',NULL,0.300,'verified'),
('PHY-MOT-002',(SELECT id FROM topics WHERE slug='motion'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='physics')),'Motion needs a constant force','An object needs a constant force to keep moving.','The learner confuses force with motion because friction is always present.','Things stop when we stop pushing them.','Puck needs a push to keep sliding','distractor',NULL,0.300,'verified'),
('PHY-ELE-001',(SELECT id FROM topics WHERE slug='electricity'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='physics')),'Current is used up by a bulb','Current gets used up as it passes through a bulb.','The learner thinks the bulb consumes current instead of transferring energy.','The bulb gives out light, so something must be used.','Less current after the bulb','distractor',NULL,0.300,'verified'),
('PHY-HEAT-001',(SELECT id FROM topics WHERE slug='heat'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='physics')),'Heat and temperature are the same','The hotter thing always holds more heat energy.','The learner merges temperature with total thermal energy.','Both words are used for "how hot".','Hot cup has more energy than a warm bath','distractor',NULL,0.300,'verified'),
('COMP-VAR-001',(SELECT id FROM topics WHERE slug='variables'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='computing')),'A variable stores a formula','b = a + 1 keeps b linked to a, so b changes when a changes.','The learner treats assignment like a spreadsheet formula.','Maths equations stay true for all values.','a=2; b=a+1; a=5; b is 6','distractor',NULL,0.300,'verified'),
('COMP-ASG-001',(SELECT id FROM topics WHERE slug='variables'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='computing')),'x = x + 1 is a false equation','x = x + 1 is impossible or an error.','The learner reads = as maths equality instead of assignment.','Algebra lessons use = to mean both sides are equal.','x = x + 1 is an error','distractor',NULL,0.300,'verified'),
('COMP-IDX-001',(SELECT id FROM topics WHERE slug='data-structures'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='computing')),'Lists start at index 1','The first item in a list is at index 1.','The learner counts items the way people count in daily life.','We count objects from one.','first item index is 1','distractor',NULL,0.300,'verified'),
('COMP-EQ-001',(SELECT id FROM topics WHERE slug='control'),(SELECT id FROM pack_versions WHERE subject_id=(SELECT id FROM subjects WHERE slug='computing')),'Single = tests equality','Use = to check whether two values are equal.','The learner confuses assignment with comparison.','In maths, = means equal.','if x = 5','distractor',NULL,0.300,'verified');

INSERT INTO misconception_relations (parent_id,child_id,relation) VALUES
((SELECT id FROM misconceptions WHERE code='MATH-OPS-001'),(SELECT id FROM misconceptions WHERE code='MATH-OPS-002'),'related'),
((SELECT id FROM misconceptions WHERE code='COMP-ASG-001'),(SELECT id FROM misconceptions WHERE code='COMP-EQ-001'),'related');

-- Probe bank: a student holding the misconception chooses the predicted wrong key
INSERT INTO probe_bank (misconception_id,prompt,options_json,correct_key,predicted_wrong_key,rationale) VALUES
((SELECT id FROM misconceptions WHERE code='MATH-FRAC-001'),'Is 1/2 + 1/2 equal to 2/4?','[{"key":"A","text":"Yes"},{"key":"B","text":"No"}]','B','A','The add-the-tops rule gives 2/4, which equals one half, so half plus half would equal half.'),
((SELECT id FROM misconceptions WHERE code='MATH-FRAC-001'),'Which is larger: 1/2 + 1/4, or 1/2?','[{"key":"A","text":"1/2"},{"key":"B","text":"1/2 + 1/4"}]','B','A','The rule gives 2/6, which is smaller than 1/2, so adding made it smaller.'),
((SELECT id FROM misconceptions WHERE code='MATH-FRAC-002'),'Which is larger: 1/3 or 1/5?','[{"key":"A","text":"1/5"},{"key":"B","text":"1/3"}]','B','A','A student comparing denominators as whole numbers picks 1/5.'),
((SELECT id FROM misconceptions WHERE code='MATH-DEC-001'),'Which is larger: 0.35 or 0.5?','[{"key":"A","text":"0.35"},{"key":"B","text":"0.5"}]','B','A','Reading 35 as bigger than 5 gives 0.35.'),
((SELECT id FROM misconceptions WHERE code='MATH-OPS-001'),'Is 8 x 0.5 greater than 8?','[{"key":"A","text":"Yes"},{"key":"B","text":"No"}]','B','A','Believing multiplication always enlarges predicts Yes.'),
((SELECT id FROM misconceptions WHERE code='MATH-OPS-002'),'Is 6 / 0.5 less than 6?','[{"key":"A","text":"Yes"},{"key":"B","text":"No"}]','B','A','Believing division always shrinks predicts Yes.'),
((SELECT id FROM misconceptions WHERE code='MATH-NEG-001'),'What is 2 - 6?','[{"key":"A","text":"4"},{"key":"B","text":"-4"}]','B','A','Taking the smaller from the larger gives 4.'),
((SELECT id FROM misconceptions WHERE code='MATH-ALG-001'),'When x = 2, are 3x + 2 and 5x equal?','[{"key":"A","text":"Yes"},{"key":"B","text":"No"}]','B','A','3(2)+2 = 8 but 5(2) = 10, so merging unlike terms fails.'),
((SELECT id FROM misconceptions WHERE code='MATH-ALG-002'),'If a = 1 and b = 2, is (a + b)^2 equal to a^2 + b^2?','[{"key":"A","text":"Yes"},{"key":"B","text":"No"}]','B','A','(1+2)^2 = 9 but 1 + 4 = 5.'),
((SELECT id FROM misconceptions WHERE code='PHY-MOT-001'),'Ignoring air, a 1 kg ball and a 5 kg ball are dropped together. What happens?','[{"key":"A","text":"The 5 kg ball lands first"},{"key":"B","text":"They land at the same time"}]','B','A','Believing heavier falls faster predicts A.'),
((SELECT id FROM misconceptions WHERE code='PHY-MOT-002'),'A puck slides on frictionless ice at steady speed. What keeps it moving?','[{"key":"A","text":"A constant push"},{"key":"B","text":"Nothing, it keeps moving by itself"}]','B','A','Believing motion needs force predicts a constant push.'),
((SELECT id FROM misconceptions WHERE code='PHY-ELE-001'),'In a series circuit, how does the current after the bulb compare with before it?','[{"key":"A","text":"Less after the bulb"},{"key":"B","text":"The same"}]','B','A','Believing the bulb uses up current predicts less.'),
((SELECT id FROM misconceptions WHERE code='PHY-HEAT-001'),'A bath of water at 40 C and a cup of water at 90 C. Which holds more thermal energy?','[{"key":"A","text":"The cup"},{"key":"B","text":"The bath"}]','B','A','Equating temperature with energy predicts the cup.'),
((SELECT id FROM misconceptions WHERE code='COMP-VAR-001'),'a = 2; b = a + 1; a = 5. What is b now?','[{"key":"A","text":"6"},{"key":"B","text":"3"}]','B','A','Believing b stays linked to a predicts 6.'),
((SELECT id FROM misconceptions WHERE code='COMP-ASG-001'),'x = 3; x = x + 1. What is x afterwards?','[{"key":"A","text":"It is an error"},{"key":"B","text":"4"}]','B','A','Reading = as maths equality predicts an error.'),
((SELECT id FROM misconceptions WHERE code='COMP-IDX-001'),'In Python, what is the index of the first item in ["a","b","c"]?','[{"key":"A","text":"1"},{"key":"B","text":"0"}]','B','A','Counting from one predicts 1.'),
((SELECT id FROM misconceptions WHERE code='COMP-EQ-001'),'Which operator tests equality in Python?','[{"key":"A","text":"="},{"key":"B","text":"=="}]','B','A','Confusing assignment with comparison predicts a single =.');

-- Remediation templates: belief, prediction, contradiction, corrected model
INSERT INTO remediation_templates (misconception_id,kind,title,content_json) VALUES
((SELECT id FROM misconceptions WHERE code='MATH-FRAC-001'),'counterexample','Why 1/2 + 1/2 cannot be 2/4','{"belief":"Add the tops and add the bottoms.","prediction":"1/2 + 1/2 = 2/4.","contradiction":"2/4 equals one half, so half plus half would equal half. That is impossible.","corrected_model":"Fractions must share a denominator (the same size pieces) before the tops can be added.","visual":"fraction_strips"}'),
((SELECT id FROM misconceptions WHERE code='MATH-FRAC-001'),'worked_contrast','Common denominators step by step','{"steps":["1/3 = 4/12","1/4 = 3/12","4/12 + 3/12 = 7/12"],"check":"7/12 is a little more than one half, which makes sense."}'),
((SELECT id FROM misconceptions WHERE code='MATH-NEG-001'),'counterexample','2 - 6 on a number line','{"belief":"Take the smaller from the larger.","prediction":"2 - 6 = 4.","contradiction":"Start at 2 and move 6 steps left on a number line. You pass zero, so you cannot land on 4.","corrected_model":"Subtraction moves left. Going past zero gives a negative number: 2 - 6 = -4."}'),
((SELECT id FROM misconceptions WHERE code='MATH-ALG-001'),'counterexample','Test with a number','{"belief":"3x + 2 = 5x.","prediction":"Both sides equal when x = 2.","contradiction":"3(2) + 2 = 8, but 5(2) = 10.","corrected_model":"Only like terms combine. 3x and 2 are different kinds of terms."}'),
((SELECT id FROM misconceptions WHERE code='MATH-ALG-002'),'counterexample','Test (a + b)^2 with numbers','{"belief":"(a + b)^2 = a^2 + b^2.","prediction":"With a=1, b=2 both sides are 5.","contradiction":"(1+2)^2 = 9, but 1^2 + 2^2 = 5.","corrected_model":"(a + b)^2 = (a + b)(a + b) = a^2 + 2ab + b^2."}');

-- Sample diagnostic questions with distractors mapped to misconceptions
INSERT INTO questions (public_id,topic_id,type,prompt,prompt_math,level,difficulty,correct_answer,explanation,exam_tag,source,verified_status) VALUES
(REPLACE(UUID(),'-',''),(SELECT id FROM topics WHERE slug='fractions'),'mcq','What is 1/3 + 1/4?','\\frac{1}{3}+\\frac{1}{4}','jhs',1,'7/12','Use a common denominator: 4/12 + 3/12 = 7/12.','BECE','pack','verified'),
(REPLACE(UUID(),'-',''),(SELECT id FROM topics WHERE slug='negative-numbers'),'mcq','What is 3 - 5?','3-5','jhs',1,'-2','Moving 5 steps left from 3 lands on -2.','BECE','pack','verified'),
(REPLACE(UUID(),'-',''),(SELECT id FROM topics WHERE slug='algebra'),'mcq','What is (a + b)^2 when a = 1 and b = 2?','(a+b)^2','shs',2,'9','(1 + 2)^2 = 3^2 = 9.','WASSCE','pack','verified'),
(REPLACE(UUID(),'-',''),(SELECT id FROM topics WHERE slug='decimals'),'mcq','Which is larger: 0.35 or 0.5?','0.35 \\text{ or } 0.5','jhs',1,'0.5','0.5 = 0.50, which is more than 0.35.','BECE','pack','verified');

INSERT INTO question_options (question_id,option_key,option_text,is_correct,misconception_id) VALUES
((SELECT id FROM questions WHERE prompt='What is 1/3 + 1/4?'),'A','2/7',0,(SELECT id FROM misconceptions WHERE code='MATH-FRAC-001')),
((SELECT id FROM questions WHERE prompt='What is 1/3 + 1/4?'),'B','7/12',1,NULL),
((SELECT id FROM questions WHERE prompt='What is 1/3 + 1/4?'),'C','1/12',0,NULL),
((SELECT id FROM questions WHERE prompt='What is 1/3 + 1/4?'),'D','2/12',0,NULL),
((SELECT id FROM questions WHERE prompt='What is 3 - 5?'),'A','2',0,(SELECT id FROM misconceptions WHERE code='MATH-NEG-001')),
((SELECT id FROM questions WHERE prompt='What is 3 - 5?'),'B','-2',1,NULL),
((SELECT id FROM questions WHERE prompt='What is 3 - 5?'),'C','8',0,NULL),
((SELECT id FROM questions WHERE prompt='What is 3 - 5?'),'D','-8',0,NULL),
((SELECT id FROM questions WHERE prompt='What is (a + b)^2 when a = 1 and b = 2?'),'A','5',0,(SELECT id FROM misconceptions WHERE code='MATH-ALG-002')),
((SELECT id FROM questions WHERE prompt='What is (a + b)^2 when a = 1 and b = 2?'),'B','9',1,NULL),
((SELECT id FROM questions WHERE prompt='What is (a + b)^2 when a = 1 and b = 2?'),'C','3',0,NULL),
((SELECT id FROM questions WHERE prompt='What is (a + b)^2 when a = 1 and b = 2?'),'D','6',0,NULL),
((SELECT id FROM questions WHERE prompt='Which is larger: 0.35 or 0.5?'),'A','0.35',0,(SELECT id FROM misconceptions WHERE code='MATH-DEC-001')),
((SELECT id FROM questions WHERE prompt='Which is larger: 0.35 or 0.5?'),'B','0.5',1,NULL),
((SELECT id FROM questions WHERE prompt='Which is larger: 0.35 or 0.5?'),'C','They are equal',0,NULL),
((SELECT id FROM questions WHERE prompt='Which is larger: 0.35 or 0.5?'),'D','I am not sure',0,NULL);

INSERT INTO schema_migrations (version) VALUES ('010_seed_content');
