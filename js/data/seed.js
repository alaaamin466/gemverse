/* GYMVERSE — demo data: branches, studios, trainers, timetable generation */
(function () {
  'use strict';
  var GY = (window.GY = window.GY || {});
  var U = GY.util;
  var DAY = 86400000;

  var branches = [
    {
      id: 'b1', name: 'Downtown Arena', area: 'Financial District',
      address: '400 Meridian Ave, Level 2', phone: '+1 (415) 555-0140',
      hours: '05:30 – 23:00', image: 'assets/img/strength.jpg',
      blurb: 'Flagship training floor with six dedicated studios, a reformer lab and the biggest strength zone in the city.',
      priceDelta: 0
    },
    {
      id: 'b2', name: 'Riverside Studio', area: 'Riverside',
      address: '18 Riverside Walk', phone: '+1 (415) 555-0188',
      hours: '06:00 – 22:00', image: 'assets/img/yoga.jpg',
      blurb: 'Calm, light-filled studio focused on mind-body practice, clinical Pilates and aquatic fitness.',
      priceDelta: 1
    },
    {
      id: 'b3', name: 'Uptown Loft', area: 'Uptown',
      address: '77 Foundry Lane, Loft 3', phone: '+1 (415) 555-0126',
      hours: '06:00 – 22:30', image: 'assets/img/dance.jpg',
      blurb: 'High-energy loft with rooftop training deck, dance studios, combat zone and rhythm cycling.',
      priceDelta: 3
    }
  ];

  var rooms = [
    { id: 'b1-serenity', branchId: 'b1', name: 'Serenity Studio', capacity: 18, supports: ['yoga', 'pilates', 'specialized'], flags: [], note: 'Heated floor, dimmable light' },
    { id: 'b1-reformer', branchId: 'b1', name: 'Reformer Lab', capacity: 8, supports: ['pilates'], flags: ['reformer'], note: '8 Balanced Body reformers' },
    { id: 'b1-strength', branchId: 'b1', name: 'Strength Floor', capacity: 24, supports: ['strength', 'cardio', 'specialized'], flags: [], note: 'Racks, platforms, turf lane' },
    { id: 'b1-combat', branchId: 'b1', name: 'Combat Zone', capacity: 16, supports: ['combat'], flags: [], note: '12 bags, full ring' },
    { id: 'b1-cycle', branchId: 'b1', name: 'Cycle Deck', capacity: 20, supports: ['cardio'], flags: ['bikes'], note: '20 Stages SC3 bikes' },
    { id: 'b1-pt', branchId: 'b1', name: 'PT Suite 1', capacity: 4, supports: ['personal'], flags: [], note: 'Private coaching suite' },
    { id: 'b2-serenity', branchId: 'b2', name: 'River Room', capacity: 16, supports: ['yoga', 'pilates', 'specialized'], flags: [], note: 'River-facing, cork floor' },
    { id: 'b2-reformer', branchId: 'b2', name: 'Reformer Loft', capacity: 8, supports: ['pilates'], flags: ['reformer'], note: '8 Merrithew reformers' },
    { id: 'b2-rhythm', branchId: 'b2', name: 'Rhythm Studio', capacity: 22, supports: ['dance', 'cardio', 'specialized'], flags: [], note: 'Sprung floor, mirror wall' },
    { id: 'b2-aqua', branchId: 'b2', name: 'Aqua Deck', capacity: 12, supports: ['aquatic'], flags: ['pool'], note: 'Heated 28°C, 4 lanes' },
    { id: 'b2-pt', branchId: 'b2', name: 'Riverside PT', capacity: 3, supports: ['personal'], flags: [], note: 'Private coaching suite' },
    { id: 'b3-serenity', branchId: 'b3', name: 'Loft Sanctuary', capacity: 14, supports: ['yoga', 'pilates', 'specialized'], flags: [], note: 'Skylight, warm bamboo floor' },
    { id: 'b3-rhythm', branchId: 'b3', name: 'Loft Rhythm', capacity: 26, supports: ['dance', 'cardio', 'specialized'], flags: [], note: 'Club sound system, LED wall' },
    { id: 'b3-strength', branchId: 'b3', name: 'Loft Iron', capacity: 20, supports: ['strength', 'cardio', 'specialized'], flags: [], note: 'Six racks, dumbbells to 60kg' },
    { id: 'b3-combat', branchId: 'b3', name: 'Loft Combat', capacity: 14, supports: ['combat'], flags: [], note: 'Ring, bags, pad wall' },
    { id: 'b3-roof', branchId: 'b3', name: 'Rooftop Deck', capacity: 25, supports: ['cardio', 'specialized', 'combat'], flags: ['outdoor'], note: 'Open-air, weatherproofed' },
    { id: 'b3-cycle', branchId: 'b3', name: 'Loft Cycle', capacity: 18, supports: ['cardio'], flags: ['bikes'], note: '18 Keiser bikes' },
    { id: 'b3-pt', branchId: 'b3', name: 'Loft PT', capacity: 3, supports: ['personal'], flags: [], note: 'Private coaching suite' }
  ];

  var trainers = [
    {
      id: 't1', name: 'Aria Nakamura', category: 'yoga', branches: ['b1', 'b2'], pref: 'morning',
      disciplines: ['Hatha Yoga', 'Vinyasa Yoga', 'Ashtanga Yoga', 'Power Yoga'],
      baseRating: 4.9, baseReviews: 214, years: 9, accent: '#8fe3c4',
      title: 'Senior Yoga Teacher · E-RYT 500',
      bio: 'Aria trained in Mysore and Kyoto, and teaches flow with an obsessive focus on breath, bandhas and joint safety.'
    },
    {
      id: 't2', name: 'Leila Haddad', category: 'yoga', branches: ['b2'], pref: 'midday',
      disciplines: ['Yin Yoga', 'Restorative Yoga', 'Meditation', 'Breathing Exercises', 'Mindfulness', 'Deep Relaxation'],
      baseRating: 4.8, baseReviews: 168, years: 11, accent: '#b8e0d2',
      title: 'Mind-Body Teacher · Yoga Nidra Specialist',
      bio: 'Leila spent a decade in somatic therapy before teaching. Her classes are slow, quiet and expertly held.'
    },
    {
      id: 't3', name: 'Sofia Mendes', category: 'yoga', branches: ['b1'], pref: 'evening',
      disciplines: ['Hot Yoga', 'Prenatal Yoga', 'Power Yoga'],
      baseRating: 4.7, baseReviews: 141, years: 6, accent: '#f0b7a1',
      title: 'Hot Yoga & Prenatal Specialist',
      bio: 'Sofia coaches heated practice with careful hydration and pacing, and leads GYMVERSE\'s prenatal program.'
    },
    {
      id: 't4', name: 'Priya Raman', category: 'pilates', branches: ['b1', 'b2'], pref: 'morning',
      disciplines: ['Mat Pilates', 'Clinical Pilates', 'Beginner Pilates', 'Advanced Pilates', 'Posture Correction'],
      baseRating: 4.9, baseReviews: 240, years: 12, accent: '#f6b9cb',
      title: 'Clinical Pilates Lead · Physiotherapist',
      bio: 'Priya is a licensed physiotherapist who bridges rehab and performance, screening every client before loading them.'
    },
    {
      id: 't5', name: 'Elena Volkov', category: 'pilates', branches: ['b2'], pref: 'evening',
      disciplines: ['Reformer Pilates', 'Stretching', 'Full Body Stretch', 'Mobility Training', 'Flexibility Training'],
      baseRating: 4.8, baseReviews: 187, years: 8, accent: '#e9c7d4',
      title: 'Reformer & Mobility Coach',
      bio: 'A former ballet dancer, Elena builds length and control with precise, spring-loaded progressions.'
    },
    {
      id: 't6', name: 'Marcus Reed', category: 'cardio', branches: ['b1', 'b3'], pref: 'evening',
      disciplines: ['HIIT', 'Bootcamp', 'Tabata', 'Circuit Training', 'Jump Rope', 'Endurance Training'],
      baseRating: 4.8, baseReviews: 302, years: 7, accent: '#ff9a5c',
      title: 'Conditioning Coach · CSCS',
      bio: 'Marcus runs the toughest intervals in the building and scales every single one of them to your level.'
    },
    {
      id: 't7', name: 'Diego Alvarez', category: 'cardio', branches: ['b1', 'b3'], pref: 'morning',
      disciplines: ['Indoor Cycling', 'Spinning', 'LISS Cardio', 'Treadmill Training'],
      baseRating: 4.9, baseReviews: 276, years: 10, accent: '#ffc247',
      title: 'Endurance & Cycling Lead',
      bio: 'Diego raced criteriums for eight years. Expect watt targets, cadence drills and a properly dark playlist.'
    },
    {
      id: 't8', name: 'Nia Brooks', category: 'dance', branches: ['b2', 'b3'], pref: 'evening',
      disciplines: ['Zumba', 'Zumba Toning', 'Dance Fitness', 'Body Jam', 'Aerobics'],
      baseRating: 4.9, baseReviews: 318, years: 9, accent: '#ff5fa8',
      title: 'Group Fitness Lead · Zumba ZIN',
      bio: 'Nia choreographs for the front row and the back row. No mirrors required, no experience required.'
    },
    {
      id: 't9', name: 'Camille Duarte', category: 'dance', branches: ['b3'], pref: 'evening',
      disciplines: ['Hip Hop Dance', 'Step Aerobics', 'Latin Dance', 'Belly Dance Fitness'],
      baseRating: 4.7, baseReviews: 158, years: 6, accent: '#ff8a3d',
      title: 'Street & Latin Dance Coach',
      bio: 'Camille came up in competitive street dance and teaches choreography you actually want to perform.'
    },
    {
      id: 't10', name: 'Tariq Osei', category: 'combat', branches: ['b1', 'b3'], pref: 'evening',
      disciplines: ['Boxing', 'Kickboxing', 'Self-Defense Fitness', 'Combat Conditioning'],
      baseRating: 4.9, baseReviews: 264, years: 11, accent: '#ff5b5b',
      title: 'Boxing Coach · Former Amateur Champion',
      bio: 'Tariq builds fighters from scratch: stance first, power last. His conditioning blocks are legendary.'
    },
    {
      id: 't11', name: 'Kenji Watanabe', category: 'combat', branches: ['b3'], pref: 'morning',
      disciplines: ['Muay Thai', 'MMA Fitness', 'Karate', 'Taekwondo'],
      baseRating: 4.8, baseReviews: 196, years: 14, accent: '#ff9a4d',
      title: 'Muay Thai & Karate Instructor',
      bio: 'Kenji holds a 4th dan in Shotokan and fought 32 Muay Thai bouts. Fundamentals are non-negotiable.'
    },
    {
      id: 't12', name: 'Roman Petrov', category: 'strength', branches: ['b1'], pref: 'evening',
      disciplines: ['Bodybuilding', 'Powerlifting', 'Olympic Weightlifting', 'Strength Training'],
      baseRating: 4.8, baseReviews: 212, years: 13, accent: '#7fa6ff',
      title: 'Strength Lead · IPF Certified',
      bio: 'Roman has coached national-level lifters for a decade. Barspeed, bracing and patience.'
    },
    {
      id: 't13', name: 'Bianca Rossi', category: 'strength', branches: ['b1', 'b3'], pref: 'midday',
      disciplines: ['Functional Training', 'Full Body Workout', 'Upper Body Workout', 'Lower Body Workout', 'Glutes Training', 'Core Training', 'Abs Workout', 'Resistance Training', 'Kettlebell Training', 'TRX Suspension Training'],
      baseRating: 4.7, baseReviews: 233, years: 8, accent: '#f5b544',
      title: 'Functional Strength Coach',
      bio: 'Bianca trains movement quality first: hinges, carries and single-leg strength that hold up outside the gym.'
    },
    {
      id: 't14', name: 'Grace Adeyemi', category: 'specialized', branches: ['b2', 'b3'], pref: 'morning',
      disciplines: ['Senior Fitness', 'Balance Training', 'Rehabilitation Exercise', 'Low Impact Fitness', 'Beginner Fitness'],
      baseRating: 4.9, baseReviews: 174, years: 15, accent: '#b39bff',
      title: 'Adaptive & Rehab Specialist',
      bio: 'Grace has spent fifteen years making training accessible — post-surgery, post-natal, or brand new to exercise.'
    },
    {
      id: 't15', name: 'Amara Silva', category: 'specialized', branches: ['b2', 'b3'], pref: 'midday',
      disciplines: ['Women\'s Fitness', 'Weight Loss Classes', 'Muscle Building Classes'],
      baseRating: 4.8, baseReviews: 149, years: 7, accent: '#d3b9ff',
      title: 'Body Composition Coach',
      bio: 'Amara pairs strength programming with realistic habit work and monthly body composition reviews.'
    },
    {
      id: 't16', name: 'Jonas Weber', category: 'specialized', branches: ['b1', 'b3'], pref: 'evening',
      disciplines: ['Athletic Conditioning', 'Sports Performance'],
      baseRating: 4.8, baseReviews: 121, years: 9, accent: '#9f8bff',
      title: 'Performance Coach · MSc Sport Science',
      bio: 'Jonas builds periodised plans for competitive athletes, from sprint mechanics to return-to-play testing.'
    },
    {
      id: 't17', name: 'Hana Kim', category: 'aquatic', branches: ['b2'], pref: 'morning',
      disciplines: ['Swimming Lessons', 'Aqua Fitness', 'Aqua Aerobics', 'Water Resistance Training', 'Swimming Conditioning'],
      baseRating: 4.9, baseReviews: 132, years: 10, accent: '#48e0f0',
      title: 'Aquatics Lead · Level 3 Swim Coach',
      bio: 'Hana swam nationally and now teaches adults to actually enjoy the water. Lanes are grouped by ability.'
    },
    {
      id: 't18', name: 'Theo Lindqvist', category: 'personal', branches: ['b1', 'b2'], pref: 'midday',
      disciplines: ['One-to-One Personal Training', 'Partner Training', 'Small Group Personal Training', 'Online Coaching', 'Fitness Assessment Sessions', 'Body Composition Assessment', 'Personal Workout Consultation'],
      baseRating: 5.0, baseReviews: 96, years: 12, accent: '#f2c14e',
      title: 'Head of Personal Training',
      bio: 'Theo has coached CEOs, new parents and national athletes. The plan changes weekly — the accountability never does.'
    }
  ];

  var MEMBER_POOL = ['Noah Park', 'Isabella Rossi', 'Liam Chen', 'Zara Ahmed', 'Mateo Silva', 'Chloe Dubois', 'Ethan Brooks', 'Aisha Bello',
    'Lucas Meyer', 'Hannah Kim', 'Omar Haddad', 'Elena Petrova', 'Jonah Reed', 'Mei Tanaka', 'Diego Torres', 'Sara Lindqvist',
    'Adam Novak', 'Priya Shah', 'Ben Carter', 'Yara Nasser', 'Felix Braun', 'Nadia Rahman', 'Oscar Lindgren', 'Ivy Nakamura',
    'Sam Okafor', 'Lena Fischer', 'Kai Wilson', 'Maya Goldstein', 'Ravi Menon', 'Tess de Vries', 'Hugo Laurent', 'Amira Said',
    'Jake Sullivan', 'Nora Ellis', 'Yusuf Demir', 'Clara Nowak', 'Andre Costa', 'Leah Weiss', 'Tom Becker', 'Rina Sato',
    'Marco Bianchi', 'Elif Yilmaz', 'Aaron Price', 'Sofia Almeida', 'Viktor Hansen', 'Nina Kowalski', 'Eli Rosen', 'Fatima Zahra'];

  var REVIEW_COMMENTS = [
    'Best class I have taken here. Cues were so clear that I finally understood the movement.',
    'Perfect balance of challenge and care. Left feeling worked, not wrecked.',
    'The instructor noticed my alignment issue in the first five minutes and fixed it. Worth every cent.',
    'Brutal in the best way. Already booked the same slot next week.',
    'Great energy in the room, and the playlist carried me through the last block.',
    'I am a complete beginner and never felt out of place. Options for every single exercise.',
    'Studio was spotless and the equipment was already set up when we walked in.',
    'Small details matter — the coach reset my form three times and my back has never felt better.',
    'Exactly the intensity I needed before work. In and out on time.',
    'Loved it. Only note: the room got warm by the end, which honestly made it better.',
    'This has become the anchor of my week. The progression is obvious after six sessions.',
    'Superb coaching. Both advanced and new people in the room got individual attention.',
    'I came for the workout and stayed for the community. Everyone was so welcoming.',
    'Technique-first teaching that actually respects your joints. Rare and appreciated.'
  ];

  function timeSlotsFor(catId) {
    return {
      yoga: ['06:30', '07:30', '08:30', '10:00', '12:15', '17:30', '18:30', '19:45'],
      pilates: ['07:00', '08:15', '09:30', '11:00', '12:30', '17:00', '18:15', '19:30'],
      dance: ['06:45', '08:00', '09:15', '12:00', '17:45', '18:45', '19:45', '20:30'],
      cardio: ['06:00', '07:00', '08:00', '09:15', '12:15', '17:00', '18:00', '19:15', '20:15'],
      strength: ['06:15', '07:15', '08:30', '12:00', '16:45', '18:00', '19:15', '20:15'],
      combat: ['07:00', '08:15', '12:15', '17:30', '18:45', '20:00'],
      aquatic: ['07:00', '08:30', '10:00', '12:30', '17:15', '18:30'],
      specialized: ['07:30', '09:00', '10:30', '12:00', '14:00', '17:00', '18:15'],
      personal: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    }[catId];
  }

  function buildSeed() {
    var today = U.startOfDay(new Date());
    var windowStart = U.addDays(today, -28);
    var windowEnd = U.addDays(today, 41);

    /* ---- index helpers ---- */
    var byBranch = {};
    branches.forEach(function (b) { byBranch[b.id] = []; });
    rooms.forEach(function (r) { (byBranch[r.branchId] = byBranch[r.branchId] || []).push(r); });

    var trainerByName = {};
    trainers.forEach(function (t) {
      t.disciplineList = t.disciplines;
      t.disciplines.forEach(function (n) { trainerByName[n] = t; });
    });

    var occupied = []; // {weekday, start, end, trainerId, roomId}
    function isFree(entry) {
      return !occupied.some(function (o) {
        if (o.weekday !== entry.weekday) return false;
        if (o.start >= entry.end || entry.start >= o.end) return false;
        if (o.trainerId === entry.trainerId) return true;
        if (o.roomId === entry.roomId) return true;
        return false;
      });
    }

    function roomsFor(discipline, branchId) {
      return (byBranch[branchId] || []).filter(function (room) {
        if (room.supports.indexOf(discipline.category) === -1) return false;
        if (discipline.requirements.indexOf('reformer') > -1 && room.flags.indexOf('reformer') === -1) return false;
        if (discipline.requirements.indexOf('bikes') > -1 && room.flags.indexOf('bikes') === -1) return false;
        if (discipline.requirements.indexOf('pool') > -1 && room.flags.indexOf('pool') === -1) return false;
        if (discipline.requirements.indexOf('outdoor') > -1 && room.flags.indexOf('outdoor') === -1) return false;
        /* keep the reformer lab for reformer work only */
        if (room.flags.indexOf('reformer') > -1 && discipline.requirements.indexOf('reformer') === -1) return false;
        return true;
      }).sort(function (a, b) {
        return Math.abs(a.capacity - discipline.capacity) - Math.abs(b.capacity - discipline.capacity);
      });
    }

    var series = [];
    var seriesIndex = 0;

    GY.data.disciplines.forEach(function (discipline, dIndex) {
      var trainer = trainerByName[discipline.name];
      if (!trainer) return;
      var rnd = U.rng(U.hash(discipline.id) + 17);
      var slots = 2 + (rnd() > 0.62 ? 1 : 0);
      var times = timeSlotsFor(discipline.category);
      var baseDow = (U.hash(discipline.id) + dIndex) % 7;

      for (var slot = 0; slot < slots; slot++) {
        var created = false;
        for (var attempt = 0; attempt < 40 && !created; attempt++) {
          var dow = (baseDow + slot * 2 + attempt + (attempt > 12 ? slot : 0)) % 7;
          var startHM = times[(U.hash(discipline.id + slot) + attempt * 3) % times.length];
          var startMin = U.parseHM(startHM);
          var endMin = startMin + discipline.minutes;
          if (endMin > 22 * 60 + 30) continue;

          var branchOrder = trainer.branches.slice();
          if (attempt % 2) branchOrder.reverse();
          for (var bi = 0; bi < branchOrder.length && !created; bi++) {
            var branchId = branchOrder[bi];
            var candidates = roomsFor(discipline, branchId);
            if (!candidates.length) continue;
            for (var ci = 0; ci < candidates.length && !created; ci++) {
              var room = candidates[ci];
              var entry = { weekday: dow, start: startMin, end: endMin, trainerId: trainer.id, roomId: room.id };
              if (!isFree(entry)) continue;
              occupied.push(entry);
              seriesIndex += 1;
              series.push({
                id: 'sr' + U.pad(seriesIndex),
                disciplineId: discipline.id,
                trainerId: trainer.id,
                branchId: branchId,
                roomId: room.id,
                weekday: dow,
                start: startHM,
                end: U.timeKey(U.addMinutes(new Date(2020, 0, 6, Math.floor(startMin / 60), startMin % 60), discipline.minutes)),
                capacity: Math.min(room.capacity, discipline.capacity),
                price: discipline.price + branches.filter(function (b) { return b.id === branchId; })[0].priceDelta,
                createdAt: U.addDays(today, -35).toISOString()
              });
              created = true;
            }
          }
        }
      }
    });

    /* ---- materialise weekly instances ---- */
    var sessions = [];
    var sessionCounter = 0;
    var weekStart = U.startOfWeek(today);

    series.forEach(function (sr) {
      var discipline = GY.data.disciplineById(sr.disciplineId);
      for (var w = -5; w <= 7; w++) {
        var mondayIdx = (sr.weekday + 6) % 7;
        var date = U.addDays(weekStart, w * 7 + mondayIdx);
        if (date < windowStart || date > windowEnd) continue;
        var dateKey = U.dateKey(date);
        var startIso = dateKey + 'T' + sr.start;
        var endIso = dateKey + 'T' + sr.end;
        var daysAhead = Math.round((U.startOfDay(date) - today) / DAY);
        var rnd = U.rng(U.hash(sr.id + dateKey));

        var fill;
        if (daysAhead < 0) fill = 0.74 + rnd() * 0.26;
        else if (daysAhead === 0) fill = 0.66 + rnd() * 0.34;
        else if (daysAhead <= 3) fill = 0.58 + rnd() * 0.42;
        else if (daysAhead <= 10) fill = 0.42 + rnd() * 0.5;
        else fill = 0.16 + rnd() * 0.58;

        var baseEnrolled = Math.round(sr.capacity * Math.min(fill, 1));
        if (sr.capacity === 1) baseEnrolled = rnd() > 0.42 ? 1 : 0;
        /* a handful of near-term sessions sell out so the waitlist is exercised */
        if (daysAhead >= 0 && sr.capacity > 4 && rnd() > 0.9) baseEnrolled = sr.capacity;
        baseEnrolled = U.clamp(baseEnrolled, 0, sr.capacity);

        var seedReviews = 4 + Math.floor(rnd() * 34);
        var seedRating = 4.5 + Math.round(rnd() * 5) / 10;
        var lateCancel = daysAhead < 0 ? Math.round(baseEnrolled * (0.03 + rnd() * 0.07)) : 0;

        sessionCounter += 1;
        var status = 'scheduled';
        if (daysAhead < 0 && rnd() > 0.975) status = 'cancelled';

        sessions.push({
          id: 's' + U.pad(sessionCounter) + '-' + sr.id.slice(2),
          seriesId: sr.id,
          disciplineId: sr.disciplineId,
          trainerId: sr.trainerId,
          branchId: sr.branchId,
          roomId: sr.roomId,
          date: dateKey,
          start: sr.start,
          end: sr.end,
          startIso: startIso,
          endIso: endIso,
          duration: discipline.minutes,
          capacity: sr.capacity,
          price: sr.price,
          status: status,
          baseEnrolled: baseEnrolled,
          pastAttended: daysAhead < 0 ? U.clamp(baseEnrolled - lateCancel, 0, baseEnrolled) : 0,
          pastNoShow: lateCancel,
          seedRating: Math.min(5, seedRating),
          seedReviews: seedReviews,
          waitlistSeed: daysAhead >= 0 && baseEnrolled >= sr.capacity ? 1 + Math.floor(rnd() * 5) : 0,
          isFeatured: daysAhead > 0 && daysAhead < 14 && rnd() > 0.93,
          bookingDeadlineHours: discipline.category === 'personal' ? 4 : 2,
          cancelDeadlineHours: discipline.category === 'personal' ? 12 : 6,
          createdAt: U.addDays(date, -21).toISOString()
        });
      }
    });

    sessions.sort(function (a, b) { return a.startIso < b.startIso ? -1 : a.startIso > b.startIso ? 1 : 0; });

    /* ---- reviews ---- */
    var reviews = [];
    var rndReview = U.rng(20261120);
    sessions.forEach(function (s) {
      if (s.startIso >= U.dateKey(today)) return;
      if (s.status !== 'scheduled') return;
      if (rndReview() > 0.15) return;
      var count = 1 + Math.floor(rndReview() * 3);
      for (var i = 0; i < count; i++) {
        var rating = rndReview() > 0.18 ? 5 : 4;
        var r = U.rng(U.hash(s.id + 'r' + i));
        reviews.push({
          id: 'rv_' + s.id + '_' + i,
          sessionId: s.id,
          memberName: MEMBER_POOL[Math.floor(r() * MEMBER_POOL.length)],
          memberId: '',
          rating: rating,
          trainerRating: rating,
          comment: REVIEW_COMMENTS[Math.floor(r() * REVIEW_COMMENTS.length)],
          createdAt: U.addDays(s.date, 1).toISOString()
        });
      }
    });

    /* ---- profile + seeded member activity ---- */
    var profile = {
      id: 'm1',
      name: 'Maya Chen',
      email: 'maya.chen@gymverse.fit',
      membership: 'Plus',
      memberSince: '2024-03-12',
      homeBranch: 'b1',
      goal: 'Build strength without losing mobility',
      streak: 6,
      points: 2480,
      avatarColor: '#8fe3c4'
    };

    var bookings = [];
    function upcomingWithSeats(minDays, maxDays, catId) {
      return sessions.filter(function (s) {
        if (s.status !== 'scheduled') return false;
        var days = Math.round((U.toDate(s.date) - today) / DAY);
        if (days < minDays || days > maxDays) return false;
        if (U.toDate(s.startIso) < U.addMinutes(new Date(), 180)) return false;
        var discipline = GY.data.disciplineById(s.disciplineId);
        if (catId && discipline.category !== catId) return false;
        return s.baseEnrolled < s.capacity - 1;
      });
    }
    var pick1 = upcomingWithSeats(0, 1, 'yoga')[0] || upcomingWithSeats(0, 2)[0];
    var pick2 = upcomingWithSeats(2, 5, 'strength')[0] || upcomingWithSeats(2, 6)[0];
    var pick3 = upcomingWithSeats(1, 8, 'pilates')[0] || upcomingWithSeats(1, 8)[0];

    [pick1, pick2, pick3].forEach(function (s, i) {
      if (!s) return;
      bookings.push({
        id: 'bk_seed_' + i,
        sessionId: s.id,
        memberId: profile.id,
        status: 'booked',
        createdAt: U.addDays(new Date(), -2 - i).toISOString(),
        seat: 1 + Math.floor(U.rng(i + 3)() * s.capacity)
      });
    });

    var fullUpcoming = sessions.filter(function (s) {
      return s.status === 'scheduled' && s.date >= U.dateKey(today) && s.baseEnrolled >= s.capacity
        && GY.data.disciplineById(s.disciplineId).category === 'dance';
    })[0];
    if (fullUpcoming) {
      bookings.push({
        id: 'bk_seed_wait',
        sessionId: fullUpcoming.id,
        memberId: profile.id,
        status: 'waitlisted',
        createdAt: U.addDays(today, -1).toISOString(),
        waitlistPosition: fullUpcoming.waitlistSeed + 1
      });
    }

    var pastCandidates = sessions.filter(function (s) {
      return s.status === 'scheduled' && s.date < U.dateKey(today) && s.baseEnrolled > 2;
    });
    var past1 = pastCandidates[pastCandidates.length - 3];
    var past2 = pastCandidates[pastCandidates.length - 12];
    var attendance = {};
    if (past1) {
      bookings.push({ id: 'bk_past_1', sessionId: past1.id, memberId: profile.id, status: 'attended', createdAt: U.addDays(past1.date, -3).toISOString(), seat: 4 });
      attendance[past1.id] = { m1: 'attended' };
    }
    if (past2) {
      bookings.push({ id: 'bk_past_2', sessionId: past2.id, memberId: profile.id, status: 'no-show', createdAt: U.addDays(past2.date, -4).toISOString(), seat: 7 });
      attendance[past2.id] = { m1: 'no-show' };
    }

    var notifications = [
      { id: 'nt_welcome', type: 'system', title: 'Welcome back to GYMVERSE', body: 'Your Plus membership is active. 85 class formats are open for booking this week.', createdAt: U.addMinutes(new Date(), -180).toISOString(), read: false },
      { id: 'nt_promo', type: 'promo', title: 'Reformer Lab expanded', body: 'Riverside Reformer Loft now runs six additional weekly sessions.', createdAt: U.addMinutes(new Date(), -1440).toISOString(), read: false }
    ];

    return {
      version: 4,
      seededAt: new Date().toISOString(),
      generatorDay: U.dateKey(today),
      profile: profile,
      role: 'member',
      activeTrainerId: 't1',
      sessions: sessions,
      bookings: bookings,
      reviews: reviews,
      attendance: attendance,
      notifications: notifications,
      favorites: [],
      settings: { reminderEmails: true, waitlistAlerts: true, marketing: false }
    };
  }

  GY.data.branches = branches;
  GY.data.rooms = rooms;
  GY.data.trainers = trainers;
  GY.data.memberPool = MEMBER_POOL;
  GY.data.reviewComments = REVIEW_COMMENTS;
  GY.data.buildSeed = buildSeed;
})();
