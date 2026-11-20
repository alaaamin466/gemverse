/* GYMVERSE — fitness discipline catalogue: 9 disciplines, 85 class formats */
(function () {
  'use strict';
  var GY = (window.GY = window.GY || {});
  var U = GY.util;

  var categories = [
    {
      id: 'yoga', name: 'Yoga & Mind-Body', short: 'Yoga', image: 'assets/img/yoga.jpg',
      tagline: 'Breathe. Align. Arrive.',
      blurb: 'Slow strength, deep breath and quiet attention. From dynamic Vinyasa to Yoga Nidra, this is where training becomes practice.',
      principle: 'Breath before force',
      accent: '#8fe3c4', accent2: '#3fbfa0', ink: '#04130f',
      glow: 'rgba(143,227,196,.30)',
      icon: '<circle cx="12" cy="4.6" r="2.1"/><path d="M12 7v5"/><path d="M4 12h16"/><path d="M6.5 20c1.2-2.8 3-4 5.5-4s4.3 1.2 5.5 4"/>',
      themes: ['Breath-led sequencing', 'Alignment coaching', 'Restorative close']
    },
    {
      id: 'pilates', name: 'Pilates & Flexibility', short: 'Pilates', image: 'assets/img/pilates.jpg',
      tagline: 'Precision is power.',
      blurb: 'Controlled, spring-loaded and quietly brutal. Reformer and mat work that rebuilds posture, core control and usable range.',
      principle: 'Control over momentum',
      accent: '#f6b9cb', accent2: '#e07d9e', ink: '#2a0a16',
      glow: 'rgba(246,185,203,.28)',
      icon: '<circle cx="12" cy="4.4" r="2.1"/><path d="M12 6.8v5.4"/><path d="M12 12.2 8.4 20"/><path d="M12 12.2 15.6 20"/><path d="M6 10.2h12"/>',
      themes: ['Reformer & mat', 'Clinical screening', 'Mobility progressions']
    },
    {
      id: 'dance', name: 'Dance & Group Fitness', short: 'Dance', image: 'assets/img/dance.jpg',
      tagline: 'Loud music. Zero judgement.',
      blurb: 'Choreography that makes cardio feel like a night out. Latin, hip hop, step and club-style formats led by instructors who perform.',
      principle: 'Joy is a training method',
      accent: '#ff5fa8', accent2: '#ff8a3d', ink: '#21040f',
      glow: 'rgba(255,95,168,.32)',
      icon: '<path d="M9 17.5V5.6l10-2v11.6"/><circle cx="6.4" cy="17.8" r="2.7"/><circle cx="16.4" cy="15.5" r="2.7"/>',
      themes: ['Learn-then-perform blocks', 'No-experience choreography', 'Live-mix playlists']
    },
    {
      id: 'cardio', name: 'Cardio & Endurance', short: 'Cardio', image: 'assets/img/cardio.jpg',
      tagline: 'Engine building, session by session.',
      blurb: 'Intervals that respect physiology. HIIT, cycling, Tabata and bootcamp formats with heart-rate targets and scaled options.',
      principle: 'Intensity with intent',
      accent: '#ff7a45', accent2: '#ffc247', ink: '#2a0d00',
      glow: 'rgba(255,122,69,.32)',
      icon: '<path d="M2.6 12h3.6l2.2-5.4 3.4 11 2.2-5.6h7.4"/>',
      themes: ['Heart-rate zones', 'Scaled intervals', 'Performance tracking']
    },
    {
      id: 'strength', name: 'Strength & Bodybuilding', short: 'Strength', image: 'assets/img/strength.jpg',
      tagline: 'Load. Tension. Progress.',
      blurb: 'Barbells, kettlebells and honest coaching. Powerlifting standards, hypertrophy blocks and functional strength you can use.',
      principle: 'Technique then load',
      accent: '#7fa6ff', accent2: '#f5b544', ink: '#050d20',
      glow: 'rgba(127,166,255,.30)',
      icon: '<path d="M4 9.2v5.6"/><path d="M7 6.6v10.8"/><path d="M17 6.6v10.8"/><path d="M20 9.2v5.6"/><path d="M7 12h10"/>',
      themes: ['Progressive overload', 'Squat-bench-deadlift standards', 'Form-first coaching']
    },
    {
      id: 'combat', name: 'Martial Arts & Combat', short: 'Combat', image: 'assets/img/combat.jpg',
      tagline: 'Discipline you can feel.',
      blurb: 'Footwork, combinations and real conditioning. Boxing, Muay Thai, karate and MMA fitness taught by active competitors.',
      principle: 'Respect the fundamentals',
      accent: '#ff5b5b', accent2: '#ff9a4d', ink: '#210305',
      glow: 'rgba(255,91,91,.30)',
      icon: '<path d="M6.4 20v-6.6a5.2 5.2 0 0 1 5.2-5.2h2.6a3.4 3.4 0 0 1 3.4 3.4v2.2a3.4 3.4 0 0 1-3.4 3.4H9.4"/><path d="M6.4 12.6V8.2a3.6 3.6 0 0 1 7.2 0"/><path d="M9.6 20h7"/>',
      themes: ['Technique before power', 'Pad and bag work', 'Fight-camp conditioning']
    },
    {
      id: 'aquatic', name: 'Aquatic Fitness', short: 'Aquatic', image: 'assets/img/aquatic.jpg',
      tagline: 'Train without impact.',
      blurb: 'The pool is a gym with no gravity. Aqua aerobics, water resistance circuits and swim conditioning in heated 28°C water.',
      principle: 'Every direction resists',
      accent: '#48e0f0', accent2: '#2c9bff', ink: '#021a22',
      glow: 'rgba(72,224,240,.28)',
      icon: '<path d="M2.6 8.4c1.8 0 2.7-1.8 4.5-1.8s2.7 1.8 4.5 1.8 2.7-1.8 4.5-1.8 2.7 1.8 4.5 1.8"/><path d="M2.6 14c1.8 0 2.7-1.8 4.5-1.8s2.7 1.8 4.5 1.8 2.7-1.8 4.5-1.8 2.7 1.8 4.5 1.8"/><path d="M2.6 19.6c1.8 0 2.7-1.8 4.5-1.8s2.7 1.8 4.5 1.8 2.7-1.8 4.5-1.8 2.7 1.8 4.5 1.8"/>',
      themes: ['Joint-friendly loading', 'Heated 28°C pool', 'Lane-based coaching']
    },
    {
      id: 'specialized', name: 'Specialized Programs', short: 'Programs', image: 'assets/img/specialized.jpg',
      tagline: 'Built around your body.',
      blurb: 'Programs with a purpose: seniors, beginners, pre- and post-natal, rehab, weight loss and athletic performance.',
      principle: 'Everyone starts somewhere',
      accent: '#b39bff', accent2: '#7d6ae0', ink: '#0d0620',
      glow: 'rgba(179,155,255,.30)',
      icon: '<path d="M12 3.2 14.3 9l6.1 2.3-6.1 2.3L12 19.4 9.7 13.6 3.6 11.3 9.7 9z"/>',
      themes: ['Regressed and progressed options', 'Outcome tracking', 'Small supportive groups']
    },
    {
      id: 'personal', name: 'Personal Training', short: 'Personal', image: 'assets/img/personal.jpg',
      tagline: 'One plan. One coach. You.',
      blurb: 'Private coaching, partner sessions and remote programming. Assessments, body composition scans and plans that adapt weekly.',
      principle: 'Accountability compounds',
      accent: '#f2c14e', accent2: '#7fd1a8', ink: '#20170a',
      glow: 'rgba(242,193,78,.28)',
      icon: '<circle cx="12" cy="9" r="6.2"/><path d="M9.2 14.4 7.4 21l4.6-2.6 4.6 2.6-1.8-6.6"/><path d="m10 9 1.6 1.6L14.6 7.6"/>',
      themes: ['1:1 and small group', 'Body composition scans', 'Weekly plan reviews']
    }
  ];

  /* Row format:
     [name, difficulty, minutes, price, membership, intensity, capacity, equipment, focus, flags] */
  var RAW = {
    yoga: [
      ['Hatha Yoga', 'Beginner', 60, 22, 'Standard', 2, 18, 'Yoga mat, blocks, strap', 'steady classical postures held for several breaths to build alignment and calm'],
      ['Vinyasa Yoga', 'Intermediate', 60, 24, 'Standard', 4, 18, 'Yoga mat, towel', 'breath-linked flow sequences that move continuously from pose to pose'],
      ['Ashtanga Yoga', 'Advanced', 75, 28, 'Plus', 5, 14, 'Yoga mat, towel, strap', 'the traditional primary series, taught with strong breath and bandha cues'],
      ['Power Yoga', 'Intermediate', 60, 26, 'Plus', 5, 16, 'Yoga mat, towel, blocks', 'athletic, strength-driven flows with holds, core work and arm balances'],
      ['Yin Yoga', 'Beginner', 75, 24, 'Standard', 1, 16, 'Yoga mat, bolster, blocks', 'long passive floor holds that release deep connective tissue'],
      ['Restorative Yoga', 'Beginner', 60, 22, 'Standard', 1, 14, 'Yoga mat, bolster, blanket', 'fully supported poses and long holds that switch on the relaxation response'],
      ['Hot Yoga', 'Intermediate', 60, 30, 'Plus', 4, 12, 'Yoga mat, towel, water bottle', 'a heated sequence that builds heat, stamina and deep flexibility', ['heated']],
      ['Prenatal Yoga', 'Beginner', 60, 24, 'Plus', 2, 10, 'Yoga mat, bolster, blocks', 'pregnancy-safe movement, pelvic floor work and breath for labour'],
      ['Meditation', 'Beginner', 45, 18, 'Standard', 1, 20, 'Cushion, blanket', 'guided sitting practice with anchors for attention and gentle inquiry'],
      ['Breathing Exercises', 'Beginner', 30, 16, 'Standard', 1, 20, 'Mat, cushion', 'pranayama techniques for nervous-system regulation and lung capacity'],
      ['Mindfulness', 'Beginner', 45, 18, 'Standard', 1, 20, 'Mat, journal', 'attention training for everyday life, moving between stillness and awareness'],
      ['Deep Relaxation', 'Beginner', 60, 20, 'Standard', 1, 16, 'Mat, bolster, blanket', 'yoga nidra and body-scan relaxation for deep restorative rest']
    ],
    pilates: [
      ['Mat Pilates', 'Beginner', 50, 24, 'Standard', 2, 16, 'Mat, magic circle', 'classical mat work for core control, spinal articulation and posture'],
      ['Reformer Pilates', 'Intermediate', 50, 38, 'Elite', 4, 8, 'Reformer, straps, springs', 'spring-loaded reformer sequences for length, control and deep core strength', ['reformer']],
      ['Clinical Pilates', 'Beginner', 55, 45, 'Elite', 2, 6, 'Reformer, resistance band', 'rehab-informed Pilates with screening for injury recovery', ['reformer']],
      ['Beginner Pilates', 'Beginner', 45, 22, 'Standard', 1, 16, 'Mat, band', 'the foundational repertoire taught slowly with clear cues'],
      ['Advanced Pilates', 'Advanced', 55, 28, 'Plus', 5, 12, 'Mat, magic circle, weights', 'complex transitions, advanced core work and full-body control'],
      ['Stretching', 'Beginner', 40, 18, 'Standard', 1, 20, 'Mat, strap', 'guided static and dynamic stretching to restore range of motion'],
      ['Full Body Stretch', 'Beginner', 45, 19, 'Standard', 1, 20, 'Mat, strap, foam roller', 'a head-to-toe sequence that unwinds tight hips, back and shoulders'],
      ['Mobility Training', 'Intermediate', 50, 24, 'Standard', 3, 18, 'Mat, foam roller, band', 'joint-by-joint mobility drills for hips, spine and shoulders'],
      ['Flexibility Training', 'Intermediate', 50, 24, 'Plus', 3, 16, 'Mat, blocks, strap', 'progressive flexibility work with active and passive end-range training'],
      ['Posture Correction', 'Beginner', 45, 22, 'Standard', 2, 14, 'Mat, band, wall space', 'postural assessment and corrective exercise for desk-bound bodies']
    ],
    dance: [
      ['Zumba', 'Beginner', 55, 20, 'Standard', 4, 30, 'Towel, water bottle', 'Latin-inspired dance cardio with easy-to-follow party choreography'],
      ['Zumba Toning', 'Intermediate', 55, 24, 'Standard', 4, 24, 'Toning sticks, towel', 'Zumba rhythms combined with light resistance toning sticks'],
      ['Dance Fitness', 'Beginner', 50, 20, 'Standard', 4, 30, 'Towel, water bottle', 'mixed-genre dance cardio built around big, repeatable moves'],
      ['Hip Hop Dance', 'Intermediate', 55, 22, 'Standard', 4, 24, 'Sneakers, towel', 'street-style choreography with grooves, isolations and attitude'],
      ['Aerobics', 'Beginner', 45, 18, 'Standard', 3, 30, 'Sneakers, mat', 'classic aerobic blocks that lift the heart rate and coordination'],
      ['Step Aerobics', 'Intermediate', 50, 20, 'Standard', 4, 20, 'Step platform, sneakers', 'step-platform combinations with athletic intervals and choreography'],
      ['Latin Dance', 'Beginner', 55, 22, 'Standard', 3, 24, 'Dance shoes, towel', 'salsa, merengue and bachata foundations in a social setting'],
      ['Belly Dance Fitness', 'Beginner', 50, 22, 'Standard', 3, 20, 'Coin belt, towel', 'isolations, shimmies and core-driven choreography for the whole body'],
      ['Body Jam', 'Intermediate', 55, 24, 'Plus', 4, 28, 'Towel, sneakers', 'club-style choreography blending hip hop, Latin and house music']
    ],
    cardio: [
      ['HIIT', 'Intermediate', 45, 24, 'Standard', 5, 24, 'Towel, water bottle', 'short maximal intervals alternated with active recovery'],
      ['LISS Cardio', 'Beginner', 50, 18, 'Standard', 2, 20, 'Towel, water bottle', 'steady-state cardio at a conversational pace for aerobic base'],
      ['Indoor Cycling', 'Intermediate', 50, 26, 'Plus', 5, 20, 'Cycling shoes, towel', 'rhythm riding with climbs, sprints and power targets', ['bikes']],
      ['Spinning', 'Intermediate', 45, 24, 'Standard', 4, 20, 'Cycling shoes, towel', 'interval-based bike work with resistance and cadence drills', ['bikes']],
      ['Treadmill Training', 'Beginner', 45, 20, 'Standard', 3, 12, 'Running shoes, towel', 'coach-set treadmill intervals, inclines and pace work'],
      ['Circuit Training', 'Intermediate', 50, 24, 'Standard', 4, 20, 'Towel, water bottle', 'stations that rotate strength, cardio and core with minimal rest'],
      ['Tabata', 'Advanced', 30, 22, 'Plus', 5, 18, 'Towel, water bottle', 'eight rounds of twenty seconds on, ten off, across four movements'],
      ['Bootcamp', 'Advanced', 60, 28, 'Plus', 5, 25, 'Towel, gloves, water bottle', 'outdoor-style conditioning with carries, sleds and bodyweight circuits', ['outdoor']],
      ['Jump Rope', 'Intermediate', 30, 16, 'Standard', 4, 16, 'Jump rope, sneakers', 'rope-skipping skills, double-unders and conditioning rounds'],
      ['Endurance Training', 'Advanced', 75, 26, 'Plus', 5, 18, 'Heart-rate monitor, towel', 'long aerobic blocks and threshold work that build lasting stamina']
    ],
    strength: [
      ['Bodybuilding', 'Advanced', 75, 30, 'Plus', 5, 18, 'Lifting belt, straps', 'hypertrophy-focused splits with controlled tempo and volume tracking'],
      ['Strength Training', 'Intermediate', 60, 26, 'Standard', 4, 20, 'Lifting belt (optional)', 'the big compound lifts coached with progressive overload'],
      ['Powerlifting', 'Advanced', 90, 34, 'Elite', 5, 12, 'Belt, chalk, wraps', 'squat, bench and deadlift technique with competition-style loading'],
      ['Olympic Weightlifting', 'Advanced', 90, 38, 'Elite', 5, 10, 'Lifting shoes, belt, chalk', 'snatch and clean-and-jerk progressions from the ground up'],
      ['Functional Training', 'Intermediate', 50, 26, 'Standard', 4, 20, 'Kettlebell, medicine ball', 'real-world movement patterns across all three planes'],
      ['Full Body Workout', 'Beginner', 55, 22, 'Standard', 3, 22, 'Dumbbells, mat', 'a balanced session hitting push, pull, hinge, squat and carry'],
      ['Upper Body Workout', 'Intermediate', 50, 24, 'Standard', 4, 18, 'Dumbbells, bench', 'chest, back, shoulder and arm work with balanced volume'],
      ['Lower Body Workout', 'Intermediate', 50, 24, 'Standard', 4, 18, 'Barbell, dumbbells', 'squat and hinge patterns for quads, hamstrings, glutes and calves'],
      ['Glutes Training', 'Beginner', 45, 22, 'Standard', 3, 20, 'Resistance band, dumbbells', 'glute activation and progressive hip-extension loading'],
      ['Core Training', 'Beginner', 45, 20, 'Standard', 3, 20, 'Mat, medicine ball', 'anti-rotation, flexion and stability work for a resilient midline'],
      ['Abs Workout', 'Beginner', 30, 16, 'Standard', 3, 20, 'Mat, ab wheel', 'short, sharp core finishers for the abdominals and obliques'],
      ['Resistance Training', 'Beginner', 50, 22, 'Standard', 3, 20, 'Dumbbells, bands', 'machine and free-weight resistance work with perfect form first'],
      ['Kettlebell Training', 'Intermediate', 45, 24, 'Plus', 4, 16, 'Kettlebell', 'swings, cleans, presses and carries with hardstyle technique'],
      ['TRX Suspension Training', 'Intermediate', 45, 26, 'Plus', 4, 14, 'TRX straps', 'bodyweight suspension work that builds stability and control']
    ],
    combat: [
      ['Boxing', 'Intermediate', 60, 28, 'Plus', 4, 16, 'Gloves, wraps, rope', 'stance, footwork and combinations on bags and pads'],
      ['Kickboxing', 'Intermediate', 60, 28, 'Plus', 5, 16, 'Gloves, wraps, shin guards', 'punch and kick combinations with conditioning rounds'],
      ['Muay Thai', 'Advanced', 60, 30, 'Elite', 5, 14, 'Gloves, wraps, shin guards', 'the art of eight limbs: clinch, elbows, knees and round kicks'],
      ['MMA Fitness', 'Advanced', 60, 32, 'Elite', 5, 14, 'Gloves, wraps, mouthguard', 'mixed martial arts conditioning blending striking and grappling fitness'],
      ['Karate', 'Beginner', 60, 24, 'Standard', 3, 18, 'Gi, belt', 'traditional kihon, kata and kumite fundamentals'],
      ['Taekwondo', 'Intermediate', 60, 24, 'Standard', 4, 18, 'Dobok, shin guards', 'fast kicking combinations, forms and agility work'],
      ['Self-Defense Fitness', 'Beginner', 55, 22, 'Standard', 3, 16, 'Gloves (optional)', 'practical self-defence drills wrapped in a conditioning workout'],
      ['Combat Conditioning', 'Advanced', 45, 26, 'Plus', 5, 16, 'Gloves, rope', 'fight-camp conditioning: roadwork, bag work and core circuits']
    ],
    aquatic: [
      ['Swimming Lessons', 'Beginner', 45, 32, 'Elite', 2, 8, 'Swimsuit, goggles, cap', 'stroke technique and water confidence with lanes grouped by level', ['pool']],
      ['Aqua Fitness', 'Beginner', 45, 22, 'Standard', 3, 12, 'Swimsuit, water shoes', 'full-body water training using buoyancy and drag for resistance', ['pool']],
      ['Aqua Aerobics', 'Beginner', 45, 20, 'Standard', 3, 14, 'Swimsuit, float belt', 'choreographed shallow-water aerobics that protect the joints', ['pool']],
      ['Water Resistance Training', 'Intermediate', 45, 26, 'Plus', 4, 10, 'Swimsuit, aqua dumbbells', 'high-drag strength intervals against the water', ['pool']],
      ['Swimming Conditioning', 'Advanced', 60, 30, 'Plus', 5, 8, 'Swimsuit, goggles, fins', 'set-based swim training for pace, turns and aerobic capacity', ['pool']]
    ],
    specialized: [
      ['Senior Fitness', 'Beginner', 45, 18, 'Standard', 2, 16, 'Chair, light dumbbells', 'safe strength, balance and mobility work for active older adults'],
      ['Beginner Fitness', 'Beginner', 45, 20, 'Standard', 2, 18, 'Mat, light dumbbells', 'a friendly introduction to training with zero assumed experience'],
      ['Women\'s Fitness', 'Beginner', 50, 22, 'Standard', 3, 18, 'Dumbbells, band', 'strength and conditioning programming built around women\'s physiology'],
      ['Weight Loss Classes', 'Beginner', 50, 22, 'Standard', 3, 20, 'Towel, water bottle', 'sustainable fat-loss training that mixes cardio and resistance'],
      ['Muscle Building Classes', 'Intermediate', 55, 28, 'Plus', 4, 16, 'Dumbbells, barbell', 'structured hypertrophy blocks with progressive overload'],
      ['Athletic Conditioning', 'Advanced', 60, 30, 'Plus', 5, 16, 'Towel, water bottle', 'speed, agility and power work for competitive athletes'],
      ['Sports Performance', 'Advanced', 75, 34, 'Elite', 5, 12, 'Heart-rate monitor, towel', 'sport-specific periodised training for performance goals'],
      ['Rehabilitation Exercise', 'Beginner', 40, 26, 'Plus', 1, 8, 'Resistance band, mat', 'graded rehab exercise supervised through every progression'],
      ['Low Impact Fitness', 'Beginner', 45, 18, 'Standard', 2, 18, 'Mat, light weights', 'joint-friendly training with no jumping and plenty of options'],
      ['Balance Training', 'Beginner', 40, 20, 'Standard', 2, 14, 'Balance pad, band', 'proprioception and stability work to prevent falls and improve control']
    ],
    personal: [
      ['One-to-One Personal Training', 'Intermediate', 60, 65, 'Elite', 4, 1, 'Towel, water bottle', 'your own coach, your own program, fully individualised'],
      ['Partner Training', 'Intermediate', 60, 45, 'Plus', 4, 2, 'Towel, water bottle', 'train with a partner in a shared session built for two'],
      ['Small Group Personal Training', 'Intermediate', 60, 35, 'Plus', 4, 4, 'Towel, water bottle', 'coached small-group training with individual attention'],
      ['Online Coaching', 'Beginner', 45, 30, 'Standard', 2, 1, 'Laptop or phone, mat', 'remote coaching with video review and weekly programming', ['virtual']],
      ['Fitness Assessment Sessions', 'Beginner', 45, 25, 'Standard', 1, 1, 'Training kit', 'baseline testing across strength, cardio and mobility'],
      ['Body Composition Assessment', 'Beginner', 30, 20, 'Standard', 1, 1, 'Nothing needed', 'InBody scanning with a coach-led interpretation of the results'],
      ['Personal Workout Consultation', 'Beginner', 30, 18, 'Standard', 1, 1, 'Nothing needed', 'a planning session that maps your goals into a training plan']
    ]
  };

  var FRAMES = {
    yoga: 'A {diff} {mins}-minute practice centred on {focus}. Expect breath-led sequencing, hands-on alignment cues and a closing moment of stillness.',
    pilates: 'Precision-led work that targets {focus}. Controlled reps build deep core control before flowing sequences, all with expert cueing on a {room}.',
    dance: 'High-energy choreography built around {focus}. The routine is taught step by step, then run full-out with the group — no dance background needed.',
    cardio: 'A heart-rate driven session engineered around {focus}. Intervals are scaled to your level, so beginners and regulars finish strong together.',
    strength: 'Coach-led strength work centred on {focus}. Progressive loading, clear technique standards and enough rest to lift with intent.',
    combat: 'Technique-first combat training built around {focus}. Footwork, combinations and conditioning drills, with bag and pad work scaled to experience.',
    aquatic: 'Low-impact pool training focused on {focus}. Water resistance challenges every muscle while buoyancy protects your joints.',
    specialized: 'A supportive, coach-paced program designed around {focus}. Every exercise has a regression and a progression, so you train at your level.',
    personal: 'Dedicated coaching centred on {focus}. Your trainer builds the plan, adjusts the load and keeps you accountable between sessions.'
  };

  var INTENSITY_LABEL = { 1: 'Very light', 2: 'Light', 3: 'Moderate', 4: 'Hard', 5: 'Max effort' };
  var MEMBERSHIP_RANK = { Standard: 0, Plus: 1, Elite: 2 };

  var disciplines = [];
  Object.keys(RAW).forEach(function (catId) {
    RAW[catId].forEach(function (row) {
      var name = row[0], diff = row[1], mins = row[2], price = row[3], membership = row[4];
      var intensity = row[5], capacity = row[6], equipment = row[7], focus = row[8], flags = row[9] || [];
      var id = U.slug(name);
      var requirements = [];
      if (flags.indexOf('reformer') > -1) requirements.push('reformer');
      if (flags.indexOf('bikes') > -1) requirements.push('bikes');
      if (flags.indexOf('pool') > -1) requirements.push('pool');
      if (flags.indexOf('outdoor') > -1) requirements.push('outdoor');
      var description = FRAMES[catId]
        .replace('{diff}', diff.toLowerCase())
        .replace('{mins}', mins)
        .replace('{focus}', focus)
        .replace('{room}', flags.indexOf('reformer') > -1 ? 'reformer bed' : 'mat');
      disciplines.push({
        id: id, name: name, category: catId, difficulty: diff, minutes: mins,
        price: price, membership: membership, intensity: intensity, capacity: capacity,
        equipment: equipment.split(', '), focus: focus, description: description,
        flags: flags, requirements: requirements,
        water: flags.indexOf('pool') > -1,
        virtual: flags.indexOf('virtual') > -1
      });
    });
  });

  var byId = {};
  disciplines.forEach(function (d) { byId[d.id] = d; });
  var catById = {};
  categories.forEach(function (c) { catById[c.id] = c; });

  categories.forEach(function (c) {
    c.count = disciplines.filter(function (d) { return d.category === c.id; }).length;
  });

  GY.data = GY.data || {};
  GY.data.categories = categories;
  GY.data.disciplines = disciplines;
  GY.data.categoryById = function (id) { return catById[id] || null; };
  GY.data.disciplineById = function (id) { return byId[id] || null; };
  GY.data.disciplinesByCategory = function (catId) {
    return disciplines.filter(function (d) { return d.category === catId; });
  };
  GY.data.membershipRank = MEMBERSHIP_RANK;
  GY.data.intensityLabel = INTENSITY_LABEL;
})();
