/* Formula Vault — Derivations · Class 11 · Mathematics */
window.FVDERIVATIONS = (window.FVDERIVATIONS || []).concat([
  {cls:"11", subject:"math", chapter:"Quadratic Equations", derivations:[
    {t:"Derivation of the Quadratic Formula",
     given:"A general quadratic equation ax² + bx + c = 0, with a ≠ 0, solved by completing the square.",
     steps:[
       "Divide throughout by a: x² + (b/a)x + c/a = 0",
       "Move the constant to the right: x² + (b/a)x = −c/a",
       "Complete the square by adding (b/2a)² to both sides: x² + (b/a)x + (b/2a)² = (b/2a)² − c/a",
       "The left side is now a perfect square: (x + b/2a)² = (b² − 4ac)/4a²",
       "Take the square root of both sides: x + b/2a = ±√(b² − 4ac)/2a"
     ],
     result:"x = [−b ± √(b² − 4ac)] / 2a"}
  ]},  {cls:"11", subject:"math", chapter:"Sequences & Series", derivations:[
    {t:"Derivation of the Sum of n Terms of an AP",
     given:"An AP with first term a and common difference d: a, a+d, a+2d, …, a+(n−1)d.",
     steps:[
       "Write the sum forwards: Sn = a + (a+d) + (a+2d) + … + [a+(n−1)d]",
       "Write the same sum backwards: Sn = [a+(n−1)d] + [a+(n−2)d] + … + a",
       "Add the two versions term by term — each pair sums to the same value, [2a+(n−1)d], and there are n such pairs: 2Sn = n[2a + (n−1)d]"
     ],
     result:"Sn = (n/2)[2a + (n−1)d]"},
    {t:"Derivation of the Sum of n Terms of a GP",
     given:"A GP with first term a and common ratio r: a, ar, ar², …, ar^(n−1).",
     steps:[
       "Write the sum: Sn = a + ar + ar² + … + ar^(n−1)",
       "Multiply throughout by r: rSn = ar + ar² + … + ar^n",
       "Subtract the second equation from the first — all the middle terms cancel: Sn − rSn = a − ar^n",
       "Factor both sides: Sn(1 − r) = a(1 − r^n)"
     ],
     result:"Sn = a(rⁿ − 1) / (r − 1)"},
    {t:"Derivation of the Sum of an Infinite GP",
     given:"The finite-sum formula Sn = a(1 − rⁿ)/(1 − r), for |r| < 1.",
     steps:[
       "As n → ∞, since |r| < 1, the term rⁿ shrinks toward 0 (each multiplication by r makes it smaller in magnitude)",
       "Taking the limit of Sn as n → ∞: S∞ = lim(n→∞) a(1 − rⁿ)/(1 − r) = a(1 − 0)/(1 − r)"
     ],
     result:"S∞ = a / (1 − r), valid only for |r| < 1"}
  ]},  {cls:"11", subject:"math", chapter:"Trigonometric Functions", derivations:[
    {t:"Derivation of Trigonometric Sum & Difference Formulae",
     given:"Four points on the unit circle: P1=(cosx,sinx), P2=(cosy,siny), P3=(cos(x−y),sin(x−y)), and P4=(1,0). The angle ∠P1OP2 = x−y, which equals ∠P4OP3.",
     steps:[
       "Since equal angles at the centre of a circle subtend equal chords, chord P1P2 = chord P4P3, so P1P2² = P4P3²",
       "By the distance formula: P1P2² = (cosx−cosy)² + (sinx−siny)² = 2 − 2(cosx cosy + sinx siny), using sin²+cos²=1",
       "Similarly: P4P3² = (1−cos(x−y))² + (0−sin(x−y))² = 2 − 2cos(x−y)",
       "Equating the two: 2 − 2(cosx cosy + sinx siny) = 2 − 2cos(x−y), which gives cos(x−y) = cosx cosy + sinx siny",
       "Replace y with −y (using cos(−y)=cosy, sin(−y)=−siny) to get: cos(x+y) = cosx cosy − sinx siny",
       "For sin(x+y), use the co-function identity sin(x+y) = cos(π/2 − (x+y)) = cos((π/2−x) − y), then expand with the cos(x−y) formula: = cos(π/2−x)cosy + sin(π/2−x)siny = sinx cosy + cosx siny",
       "Replace y with −y in the sin(x+y) result to get: sin(x−y) = sinx cosy − cosx siny"
     ],
     result:"cos(x∓y) = cosx cosy ± sinx siny; sin(x±y) = sinx cosy ± cosx siny"},
    {t:"Derivation of the Sine Rule",
     given:"A triangle ABC with sides a, b, c opposite to angles A, B, C respectively, and circumradius R.",
     steps:[
       "Drop a perpendicular from vertex A to side BC (or its extension), meeting it at D, with AD = h",
       "In right triangle ABD: h = c·sinB. In right triangle ACD: h = b·sinC",
       "Equating the two expressions for h: c·sinB = b·sinC, which rearranges to b/sinB = c/sinC",
       "Repeating the construction by dropping a perpendicular from a different vertex gives a/sinA = b/sinB as well",
       "Combining both results: a/sinA = b/sinB = c/sinC",
       "A separate construction — drawing the diameter through one vertex and using the property that any angle in a semicircle is 90° — shows this common ratio equals exactly 2R"
     ],
     result:"a/sinA = b/sinB = c/sinC = 2R"},
    {t:"Derivation of the Cosine Rule",
     given:"A triangle with vertex A at the origin, side AB = c along the x-axis, and side AC = b at angle A to AB.",
     steps:[
       "Coordinates: A = (0,0), B = (c,0), C = (b cosA, b sinA)",
       "Side a = BC, so by the distance formula: a² = (c − b cosA)² + (b sinA)²",
       "Expand: a² = c² − 2bc cosA + b²cos²A + b²sin²A",
       "Using cos²A + sin²A = 1: a² = c² + b² − 2bc cosA",
       "Rearrange to isolate cosA"
     ],
     result:"cosA = (b² + c² − a²) / 2bc"}
  ]},  {cls:"11", subject:"math", chapter:"Straight Lines", derivations:[
    {t:"Derivation of the Distance of a Point from a Line",
     given:"A line Ax + By + C = 0 and a point (x1, y1) not on the line.",
     steps:[
       "The foot of the perpendicular from (x1,y1) to the line, call it (h,k), lies along the direction (A,B) — the normal to the line",
       "Parametrise: h = x1 + λA, k = y1 + λB for some scalar λ",
       "Since (h,k) lies on the line: A(x1+λA) + B(y1+λB) + C = 0, which gives λ = −(Ax1+By1+C)/(A²+B²)",
       "The distance is d = √[(h−x1)² + (k−y1)²] = √[(λA)² + (λB)²] = |λ|√(A²+B²)",
       "Substituting λ from above and simplifying"
     ],
     result:"d = |Ax1 + By1 + C| / √(A² + B²)"},
    {t:"Derivation of the Normal Form of a Line",
     given:"A line whose perpendicular from the origin has length p and makes angle α with the positive x-axis. Let N be the foot of this perpendicular.",
     steps:[
       "The foot of perpendicular N has coordinates (p cosα, p sinα), since it lies at distance p from the origin along direction α",
       "The line itself is perpendicular to ON, so the line's slope is the negative reciprocal of ON's slope: since ON has slope tanα, the line has slope −cotα = −cosα/sinα",
       "Using the point-slope form through N: y − p sinα = (−cosα/sinα)(x − p cosα)",
       "Multiply both sides by sinα: y sinα − p sin²α = −x cosα + p cos²α",
       "Rearrange: x cosα + y sinα = p cos²α + p sin²α = p, using sin²α+cos²α=1"
     ],
     result:"x cosα + y sinα = p"}
  ]},  {cls:"11", subject:"math", chapter:"Conic Sections", derivations:[
    {t:"Derivation of the Standard Equation of a Parabola",
     given:"By definition, a parabola is the locus of a point P(x,y) that is equidistant from a fixed point (focus) S(a,0) and a fixed line (directrix) x=−a.",
     steps:[
       "Distance from P to the focus: SP = √[(x−a)² + y²]",
       "Perpendicular distance from P to the directrix x=−a: PM = x + a",
       "By the defining property of a parabola, SP = PM: √[(x−a)² + y²] = x + a",
       "Square both sides: (x−a)² + y² = (x+a)²",
       "Expand: x² − 2ax + a² + y² = x² + 2ax + a²",
       "Simplify: y² = 4ax"
     ],
     result:"y² = 4ax"},
    {t:"Derivation of the Standard Equation of an Ellipse",
     given:"By definition, an ellipse is the locus of a point P(x,y) such that the sum of its distances from two fixed points (foci) S(ae,0) and S′(−ae,0) is a constant, 2a.",
     steps:[
       "Write the defining condition: PS + PS′ = 2a, i.e. √[(x−ae)²+y²] + √[(x+ae)²+y²] = 2a",
       "Isolate one square root and square both sides: (x+ae)²+y² = [2a − √((x−ae)²+y²)]²",
       "Expand and simplify — most terms cancel, leaving: a√[(x−ae)²+y²] = a² − aex, i.e. √[(x−ae)²+y²] = a − ex",
       "Square again: (x−ae)² + y² = a² − 2aex + e²x²",
       "Expand the left side and cancel common terms: x² − 2aex + a²e² + y² = a² − 2aex + e²x²",
       "Simplify: x²(1−e²) + y² = a²(1−e²)",
       "Divide throughout by a²(1−e²), and define b² = a²(1−e²)"
     ],
     result:"x²/a² + y²/b² = 1, where b² = a²(1−e²)"}
  ]},  {cls:"11", subject:"math", chapter:"Permutations & Combinations", derivations:[
    {t:"Derivation of nPr from the Fundamental Counting Principle",
     given:"n distinct objects, choosing and arranging r of them in order, using the multiplication principle.",
     steps:[
       "The first position can be filled in n ways",
       "The second position can be filled in (n−1) ways (one object has already been used)",
       "Continuing this pattern, the rth position can be filled in (n−r+1) ways",
       "By the multiplication principle, total arrangements = n(n−1)(n−2)⋯(n−r+1)",
       "Multiply and divide by (n−r)! to write this compactly: n(n−1)⋯(n−r+1) = n!/(n−r)!"
     ],
     result:"nPr = n! / (n−r)!"}
  ]},  {cls:"11", subject:"math", chapter:"Binomial Theorem", derivations:[
    {t:"Proof of the Binomial Theorem (by Induction)",
     given:"Claim: (x+y)ⁿ = Σ(r=0 to n) nCr x^(n−r) y^r, for every positive integer n.",
     steps:[
       "Base case, n=1: (x+y)¹ = x + y = 1C0·x + 1C1·y — matches the formula",
       "Inductive hypothesis: assume the formula holds for n=k, i.e. (x+y)^k = Σ kCr x^(k−r)y^r",
       "Multiply both sides by (x+y): (x+y)^(k+1) = (x+y)·Σ kCr x^(k−r)y^r",
       "Expanding and collecting like terms of x^(k+1−r)y^r uses Pascal's identity, kCr + kC(r−1) = (k+1)Cr, to show the coefficients match (k+1)Cr exactly"
     ],
     result:"By induction, the formula holds for all positive integers n"}
  ]},
]);
