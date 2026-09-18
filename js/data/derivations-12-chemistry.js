/* Formula Vault — Derivations · Class 12 · Chemistry */
window.FVDERIVATIONS = (window.FVDERIVATIONS || []).concat([
  {cls:"12", subject:"chemistry", chapter:"Solutions", derivations:[
    {t:"Derivation of Relative Lowering of Vapour Pressure",
     given:"A solution of a non-volatile solute in a volatile solvent, obeying Raoult's Law: p = p°·xsolvent.",
     steps:[
       "Since there are only two components, xsolvent + xsolute = 1, so xsolvent = 1 − xsolute",
       "Substitute into Raoult's law: p = p°(1 − xsolute) = p° − p°·xsolute",
       "Rearranging: p° − p = p°·xsolute",
       "Divide both sides by p°"
     ],
     result:"(p° − p)/p° = xsolute"},
    {t:"Derivation of the Osmotic Pressure Equation",
     given:"Van't Hoff observed that dilute solutions obey a relation directly analogous to the ideal gas equation, with osmotic pressure π playing the role of gas pressure.",
     steps:[
       "Van't Hoff's analogy states: πV = nRT (exactly parallel in form to PV = nRT for an ideal gas)",
       "Rearrange to isolate π: π = (n/V)RT",
       "Recognise that n/V is simply the molar concentration C of the solution"
     ],
     result:"π = CRT"}
  ]},  {cls:"12", subject:"chemistry", chapter:"Electrochemistry", derivations:[
    {t:"Derivation of the Nernst Equation",
     given:"The thermodynamic relation ΔG = ΔG° + RT ln Q, combined with the electrochemical relations ΔG = −nFE and ΔG° = −nFE°.",
     steps:[
       "Substitute the electrochemical relations into the thermodynamic one: −nFE = −nFE° + RT ln Q",
       "Divide throughout by −nF: E = E° − (RT/nF) ln Q",
       "Convert natural log to log base 10 (multiply by 2.303) and substitute T = 298 K, R = 8.314 J/mol·K, F = 96500 C/mol: (2.303RT)/(nF) = 0.0591/n"
     ],
     result:"E = E° − (0.0591/n) log Q &nbsp; (at 298 K)"},
    {t:"Derivation of the Relation Between Standard Cell Potential and Equilibrium Constant",
     given:"The Nernst equation E = E° − (0.0591/n)logQ, applied at the point where the cell reaction reaches equilibrium.",
     steps:[
       "At equilibrium, the cell can no longer do work, so E = 0. Also, the reaction quotient Q becomes equal to the equilibrium constant K at this point",
       "Substitute both conditions into the Nernst equation: 0 = E° − (0.0591/n)logK",
       "Rearrange to isolate logK"
     ],
     result:"logK = nE°/0.0591"},
    {t:"Derivation of the Relation Between Standard Cell Potential and Gibbs Free Energy",
     given:"The electrical work obtainable from a galvanic cell equals the decrease in Gibbs free energy of the cell reaction: ΔG = −nFE (general relation, valid at any E).",
     steps:[
       "This relation follows from equating the maximum electrical work (nFE, charge × potential) to the maximum non-expansion work available from the reaction, which thermodynamics identifies with −ΔG",
       "Apply this relation under standard conditions, where the cell potential is E°"
     ],
     result:"ΔG° = −nFE°"}
  ]},  {cls:"12", subject:"chemistry", chapter:"Chemical Kinetics", derivations:[
    {t:"Derivation of the Integrated Rate Law (First Order)",
     given:"A first-order reaction where Rate = −d[A]/dt = k[A].",
     steps:[
       "Separate variables: −d[A]/[A] = k·dt",
       "Integrate the left side from [A]0 (at t=0) to [A] (at time t), and the right side from 0 to t: −∫([A]0→[A]) d[A]/[A] = k∫(0→t) dt",
       "Evaluating: −(ln[A] − ln[A]0) = kt, i.e. ln([A]0/[A]) = kt",
       "Convert natural log to log base 10 by multiplying by 2.303"
     ],
     result:"k = (2.303/t) log([A]0/[A])"},
    {t:"Derivation of Half-Life for a First-Order Reaction",
     given:"The integrated first-order rate law: k = (2.303/t)log([A]0/[A]).",
     steps:[
       "At the half-life t½, exactly half the original concentration remains: [A] = [A]0/2",
       "Substitute into the integrated rate law: k = (2.303/t½)log([A]0/([A]0/2)) = (2.303/t½)log(2)",
       "Since log(2) = 0.301: k = (2.303×0.301)/t½ = 0.693/t½",
       "Rearrange to isolate t½"
     ],
     result:"t½ = 0.693/k &nbsp; (independent of initial concentration)"},
    {t:"Derivation of the Integrated Rate Law (Zero Order)",
     given:"A zero-order reaction where Rate = −d[A]/dt = k (a constant, independent of concentration).",
     steps:[
       "Separate variables: −d[A] = k·dt",
       "Integrate the left side from [A]0 to [A], and the right side from 0 to t: −([A] − [A]0) = kt"
     ],
     result:"[A] = [A]0 − kt"},
    {t:"Derivation of Half-Life for a Zero-Order Reaction",
     given:"The integrated zero-order rate law: [A] = [A]0 − kt.",
     steps:[
       "At the half-life t½: [A] = [A]0/2",
       "Substitute: [A]0/2 = [A]0 − kt½",
       "Rearrange: kt½ = [A]0 − [A]0/2 = [A]0/2"
     ],
     result:"t½ = [A]0/2k &nbsp; (DOES depend on initial concentration, unlike first order)"},
    {t:"Linearisation of the Arrhenius Equation",
     given:"The Arrhenius equation k = Ae^(−Ea/RT), used to determine activation energy experimentally.",
     steps:[
       "Take the natural logarithm of both sides: ln k = ln A + ln[e^(−Ea/RT)] = ln A − Ea/RT",
       "This equation has the form y = mx + c, with y = ln k, x = 1/T, slope m = −Ea/R, and intercept c = ln A",
       "Plotting experimental ln k values against 1/T therefore gives a straight line, whose slope directly yields Ea"
     ],
     result:"ln k = ln A − Ea/RT"}
  ]},  {cls:"12", subject:"chemistry", chapter:"Solid State", derivations:[
    {t:"Derivation of the Density of a Unit Cell",
     given:"A unit cell with Z atoms, edge length a, and molar mass M for the substance.",
     steps:[
       "Mass of one atom = M/NA (molar mass divided by Avogadro's number)",
       "Mass of the unit cell = Z × (mass of one atom) = ZM/NA",
       "Volume of the (cubic) unit cell = a³",
       "Density = mass/volume"
     ],
     result:"ρ = ZM / (NA·a³)"},
    {t:"Derivation of Packing Efficiency — Simple Cubic",
     given:"A simple cubic unit cell, atoms of radius r touching along the edge, so edge length a = 2r. Number of atoms per unit cell Z = 1 (8 corners × 1/8).",
     steps:[
       "Volume occupied by atoms = Z × (4/3)πr³ = (4/3)πr³",
       "Volume of the unit cell = a³ = (2r)³ = 8r³",
       "Packing efficiency = (volume occupied / volume of cell) × 100 = [(4/3)πr³ / 8r³] × 100"
     ],
     result:"Packing efficiency = (π/6) × 100 ≈ 52.4%"},
    {t:"Derivation of Packing Efficiency — Body-Centred Cubic (BCC)",
     given:"A BCC unit cell, atoms touching along the body diagonal: body diagonal = 4r = √3·a, so a = 4r/√3. Number of atoms per unit cell Z = 2 (8 corners × 1/8, plus 1 body-centre).",
     steps:[
       "Volume occupied by atoms = Z × (4/3)πr³ = 2 × (4/3)πr³ = (8/3)πr³",
       "Volume of the unit cell = a³ = (4r/√3)³ = 64r³/(3√3)",
       "Packing efficiency = [(8/3)πr³] / [64r³/(3√3)] × 100 = [8π√3/64] × 100"
     ],
     result:"Packing efficiency = (π√3/8) × 100 ≈ 68%"},
    {t:"Derivation of Packing Efficiency — Face-Centred Cubic (FCC)",
     given:"An FCC unit cell, atoms touching along the face diagonal: face diagonal = 4r = √2·a, so a = 2√2·r. Number of atoms per unit cell Z = 4 (8 corners × 1/8, plus 6 faces × 1/2).",
     steps:[
       "Volume occupied by atoms = Z × (4/3)πr³ = 4 × (4/3)πr³ = (16/3)πr³",
       "Volume of the unit cell = a³ = (2√2r)³ = 16√2 r³",
       "Packing efficiency = [(16/3)πr³] / [16√2 r³] × 100 = [π/(3√2)] × 100"
     ],
     result:"Packing efficiency = [π/(3√2)] × 100 ≈ 74%"}
  ]},
]);
