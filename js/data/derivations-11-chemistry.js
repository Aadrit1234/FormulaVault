/* Formula Vault — Derivations · Class 11 · Chemistry */
window.FVDERIVATIONS = (window.FVDERIVATIONS || []).concat([
  {cls:"11", subject:"chemistry", chapter:"Structure of Atom", derivations:[
    {t:"Derivation of the Rydberg Formula (from Bohr's Energy Levels)",
     given:"An electron transitions from a higher energy level n2 to a lower level n1, emitting a photon. Bohr's energy formula: En = −13.6Z²/n² eV.",
     steps:[
       "Energy released = En1 − En2 (magnitude), since En1 is more negative... more precisely: ΔE = En(final) − En(initial) with initial=n2, final=n1: ΔE = −13.6Z²/n1² − (−13.6Z²/n2²) = 13.6Z²(1/n1² − 1/n2²)",
       "This energy is carried away by the emitted photon: ΔE = hc/λ",
       "Equating: hc/λ = 13.6Z²(1/n1² − 1/n2²)",
       "Divide both sides by hc, and absorb the constant (13.6/hc, converted to appropriate units) into the Rydberg constant R"
     ],
     result:"1/λ = RZ²(1/n1² − 1/n2²)"},
    {t:"Derivation of the De Broglie Wavelength Equation",
     given:"Planck's relation for a photon's energy, E=hν=hc/λ, combined with Einstein's mass-energy relation and the relativistic energy-momentum relation for light, E=pc.",
     steps:[
       "For a photon: E = hc/λ (Planck) and also E = pc (energy-momentum relation for a massless particle)",
       "Equate the two expressions: pc = hc/λ",
       "Cancel c from both sides: p = h/λ, so λ = h/p",
       "De Broglie's hypothesis extends this same relation to ALL matter, not just photons — for a particle of mass m moving with velocity v, its momentum is p=mv"
     ],
     result:"λ = h/p = h/(mv)"},
    {t:"Derivation of Bohr's Radius, Velocity, and Energy Equations",
     given:"An electron (mass m, charge −e) orbits a nucleus of charge +Ze at radius r with speed v. Coulomb attraction supplies the centripetal force, and angular momentum is quantised per Bohr's postulate.",
     steps:[
       "Coulomb force = centripetal force: (1/4πε0)(Ze²/r²) = mv²/r, which rearranges to mv² = (1/4πε0)(Ze²/r)  …(i)",
       "Bohr's quantisation postulate: mvr = nh/2π, so v = nh/(2πmr)  …(ii)",
       "Substitute (ii) into (i) and solve for r: r = n²h²ε0/(πmZe²) — evaluating the constants gives rn = 0.529(n²/Z) Å",
       "From (ii), the orbital velocity is vn = 2πZe²/(nh·4πε0) = Ze²/(2ε0nh)",
       "Total energy = KE + PE = ½mv² − (1/4πε0)(Ze²/r). Using mv² from (i): KE = ½(1/4πε0)(Ze²/r), so En = ½(1/4πε0)(Ze²/r) − (1/4πε0)(Ze²/r) = −½(1/4πε0)(Ze²/r)",
       "Substituting the expression for r and evaluating the constants gives the standard numerical result"
     ],
     result:"rn = 0.529(n²/Z) Å; &nbsp; En = −13.6(Z²/n²) eV"}
  ]},  {cls:"11", subject:"chemistry", chapter:"States of Matter", derivations:[
    {t:"Derivation of the Ideal Gas Equation (PV = nRT)",
     given:"Three experimentally established gas laws, each holding the other variables fixed: Boyle's Law (V ∝ 1/P at constant T, n), Charles's Law (V ∝ T at constant P, n), and Avogadro's Law (V ∝ n at constant T, P).",
     steps:[
       "Combine all three proportionalities into a single relation, since V depends on all three simultaneously: V ∝ nT/P",
       "Introduce a constant of proportionality R (the universal gas constant) to convert this into an equation: V = RnT/P"
     ],
     result:"PV = nRT"}
  ]},  {cls:"11", subject:"chemistry", chapter:"Thermodynamics", derivations:[
    {t:"Derivation of ΔH = ΔU + ΔngRT",
     given:"Enthalpy is defined as H = U + PV. For a reaction at constant temperature and pressure, only gaseous species contribute significantly to any volume change.",
     steps:[
       "From the definition: ΔH = ΔU + Δ(PV)",
       "At constant pressure, Δ(PV) = PΔV",
       "For the gaseous components, applying the ideal gas law PV = nRT at constant T gives PΔV = (Δng)RT, where Δng is the change in moles of gas (products − reactants)"
     ],
     result:"ΔH = ΔU + ΔngRT"},
    {t:"Derivation of Work Done in Reversible Isothermal Expansion",
     given:"n moles of an ideal gas expand reversibly and isothermally from V1 to V2. Chemistry (IUPAC) convention: w is the work done ON the system, w = −∫PdV.",
     steps:[
       "w = −∫(V1 to V2) P dV, with P = nRT/V for an ideal gas (T constant throughout)",
       "w = −nRT∫(V1 to V2) dV/V = −nRT[lnV] from V1 to V2 = −nRT ln(V2/V1)",
       "Since V2 > V1 for an expansion, ln(V2/V1) is positive, making w negative — consistent with the gas doing work ON the surroundings during expansion, so the system loses energy as work (w<0 by the IUPAC convention)"
     ],
     result:"w = −nRT ln(V2/V1) = −2.303nRT log(V2/V1)"},
    {t:"Derivation of Work Done in Reversible Adiabatic Expansion",
     given:"n moles of an ideal gas expand reversibly and adiabatically (q=0), with temperature falling from T1 to T2.",
     steps:[
       "For an adiabatic process, q=0, so the first law ΔU=q+w simplifies to ΔU=w",
       "For an ideal gas, the internal energy change depends only on temperature: ΔU = nCv(T2−T1), regardless of the process path",
       "Since ΔU=w for this adiabatic process, substitute directly"
     ],
     result:"w = nCv(T2 − T1)"},
    {t:"Justification of the Gibbs Free Energy Equation",
     given:"Gibbs free energy is defined as G = H − TS, where H is enthalpy, T is absolute temperature, and S is entropy.",
     steps:[
       "At constant temperature, differentiate (take the change in) the defining equation: ΔG = ΔH − Δ(TS)",
       "Since T is constant, Δ(TS) = TΔS",
       "Substitute back into the expression for ΔG"
     ],
     result:"ΔG = ΔH − TΔS"}
  ]},  {cls:"11", subject:"chemistry", chapter:"Equilibrium", derivations:[
    {t:"Derivation of the Relation Between Kp and Kc",
     given:"A gaseous reaction aA + bB ⇌ cC + dD, where every species obeys the ideal gas law so its partial pressure P = (n/V)RT = [concentration]×RT.",
     steps:[
       "By definition: Kp = (P_C^c · P_D^d) / (P_A^a · P_B^b)",
       "Substitute Pi = [i]RT for every species: Kp = ([C]RT)^c([D]RT)^d / ([A]RT)^a([B]RT)^b",
       "Separate the concentration terms from the RT terms: Kp = Kc × (RT)^[(c+d)−(a+b)]",
       "Let Δn = (c+d) − (a+b), the difference between moles of gaseous products and reactants"
     ],
     result:"Kp = Kc(RT)^Δn"},
    {t:"Derivation of the Henderson-Hasselbalch Equation",
     given:"A buffer solution of a weak acid HA and its salt (conjugate base A⁻), with dissociation equilibrium HA ⇌ H⁺ + A⁻ and dissociation constant Ka.",
     steps:[
       "Write the equilibrium constant expression: Ka = [H⁺][A⁻]/[HA]",
       "Rearrange to isolate [H⁺]: [H⁺] = Ka×[HA]/[A⁻]",
       "Take the negative logarithm of both sides: −log[H⁺] = −logKa − log([HA]/[A⁻])",
       "Recognise −log[H⁺] = pH and −logKa = pKa, and flip the fraction inside the log (which flips its sign): pH = pKa + log([A⁻]/[HA])",
       "For a buffer, [A⁻] ≈ [salt] and [HA] ≈ [acid] (the equilibrium shift from initial concentrations is negligible)"
     ],
     result:"pH = pKa + log([salt]/[acid])"},
    {t:"Derivation of Ostwald's Dilution Law",
     given:"A weak electrolyte AB dissociating as AB ⇌ A⁺ + B⁻, starting at initial concentration C with degree of dissociation α at equilibrium.",
     steps:[
       "Set up an ICE table: at equilibrium, [AB] = C(1−α), [A⁺] = Cα, [B⁻] = Cα",
       "Write the equilibrium constant expression: Ka = [A⁺][B⁻]/[AB]",
       "Substitute the equilibrium concentrations: Ka = (Cα)(Cα) / [C(1−α)] = Cα²/(1−α)",
       "For a weak electrolyte, α is small (α≪1), so (1−α)≈1, giving the simplified approximate form"
     ],
     result:"Ka = Cα²/(1−α) ≈ Cα², for α≪1"}
  ]},
]);
