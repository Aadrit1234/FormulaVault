/* Formula Vault — Laws · Class 12 · Chemistry */
window.FVLAWS = (window.FVLAWS || []).concat([
  {cls:"12", subject:"chemistry", chapter:"Solutions", laws:[
    {t:"Raoult's Law",
     statement:"The partial vapour pressure of each volatile component in an ideal solution is directly proportional to its mole fraction in the solution.",
     terms:[],
     formulas:["p = p°·x", "For a non-volatile solute: (p° − p)/p° = xsolute"],
     tip:"Deviates from ideal behaviour when solute-solvent interactions differ significantly from solute-solute/solvent-solvent interactions — this deviation is exactly what produces azeotropes."}
  ]},  {cls:"12", subject:"chemistry", chapter:"Electrochemistry", laws:[
    {t:"Faraday's First Law of Electrolysis",
     statement:"The mass of a substance deposited or liberated at an electrode during electrolysis is directly proportional to the quantity of electric charge passed through the electrolyte.",
     terms:[["Z","Electrochemical equivalent of the substance"]],
     formulas:["m = Zit = ZQ"],
     tip:"1 Faraday (96500 C) is defined as exactly the charge needed to deposit one gram-equivalent of any substance — a direct numerical consequence of this law."},
    {t:"Faraday's Second Law of Electrolysis",
     statement:"When the same quantity of electric charge is passed through different electrolytes connected in series, the masses of the substances liberated at their respective electrodes are directly proportional to their chemical equivalent weights.",
     terms:[["E","Equivalent weight"]],
     formulas:["m1/m2 = E1/E2, for equal charge Q passed through each"],
     tip:"Explains why, for the same current and time, a divalent metal deposits only half as much (by moles) as a monovalent one — it takes twice the charge per mole to reduce it."},
    {t:"Kohlrausch's Law of Independent Migration of Ions",
     statement:"At infinite dilution, each ion migrates independently of its co-ion, and contributes a fixed, definite share to the total molar conductivity of the electrolyte, regardless of which other ion it's paired with.",
     terms:[["λ°+, λ°−","Limiting molar conductivities of the cation and anion"]],
     formulas:["Λ°m = λ°+ + λ°−"],
     tip:"This is what lets you calculate Λ°m for a WEAK electrolyte (which can never actually be fully dissociated, so you can't measure it directly) using only data from strong electrolytes."}
  ]},  {cls:"12", subject:"chemistry", chapter:"Chemical Kinetics", laws:[
    {t:"Rate Law",
     statement:"An experimentally determined equation expressing the rate of a reaction as a function of the molar concentrations of the reactants, each raised to a power called its order with respect to that reactant.",
     terms:[["k","Rate constant"],["m, n","Orders of reaction with respect to each reactant, found experimentally"]],
     formulas:["Rate = k[A]^m[B]^n"],
     tip:"Cannot be predicted from the balanced chemical equation alone — unlike molecularity, reaction order must always be determined by experiment."},
    {t:"Arrhenius Equation",
     statement:"The rate constant of a reaction increases exponentially with absolute temperature, with the exponential controlled by the ratio of activation energy to thermal energy.",
     terms:[["A","Pre-exponential (frequency) factor"],["Ea","Activation energy"]],
     formulas:["k = Ae^(−Ea/RT)", "ln k = ln A − Ea/RT"],
     tip:"A plot of ln k vs 1/T gives a straight line of slope −Ea/R — this is the standard experimental method for measuring a reaction's activation energy."}
  ]},  {cls:"12", subject:"chemistry", chapter:"Surface Chemistry", laws:[
    {t:"Hardy-Schulze Rule",
     statement:"The coagulating power of an electrolyte on a given colloidal sol increases sharply with the valency (charge) of the ion carrying a charge opposite to that of the colloidal particles.",
     terms:[],
     formulas:[],
     tip:"A trivalent ion (like Al³⁺ or PO4³⁻) coagulates a sol far more effectively than a monovalent one — coagulating power rises steeply, not just linearly, with charge."}
  ]},  {cls:"12", subject:"chemistry", chapter:"Solid State", laws:[
    {t:"Bragg's Law",
     statement:"X-rays are strongly diffracted (reflected) by the parallel planes of atoms in a crystal only when the path difference between rays reflected from successive planes equals a whole number of wavelengths.",
     terms:[["d","Interplanar spacing"],["θ","Glancing angle of incidence"]],
     formulas:["nλ = 2d sinθ"],
     tip:"This is the working principle behind X-ray crystallography — measuring the angles at which diffraction peaks occur lets you calculate the exact spacing between atomic planes in a crystal."}
  ]},  {cls:"12", subject:"chemistry", chapter:"Organic Reaction Rules", laws:[
    {t:"Zaitsev's (Saytzeff) Rule",
     statement:"In an elimination reaction, the major alkene product is the more substituted (and hence more stable) one, formed by removing a hydrogen atom from the carbon that has the fewest hydrogen atoms available.",
     terms:[],
     formulas:[],
     tip:"Applies to standard E1 and E2 eliminations with small, unhindered bases — contrast with the Hofmann rule, which applies when the base or leaving group is bulky."},
    {t:"Hofmann Rule",
     statement:"When elimination is carried out using a bulky base (or with a bulky leaving group, as in Hofmann elimination of quaternary ammonium salts), the major alkene product is the LEAST substituted one, formed by removing a hydrogen from the carbon with the MOST hydrogen atoms.",
     terms:[],
     formulas:[],
     tip:"The steric bulk of the base makes it easier to reach the more accessible (less hindered) hydrogen atoms, favouring the less-substituted alkene — opposite to Zaitsev's preference."},
    {t:"Popoff's Rule",
     statement:"In the oxidative cleavage of an unsymmetrical alkene, predicts which carbon fragment retains the carboxylic acid group versus the ketone, based on the relative sizes of the alkyl groups on either side of the double bond.",
     terms:[],
     formulas:[],
     tip:"A useful rule of thumb for working backward from ozonolysis/oxidative-cleavage products to figure out the structure of the original alkene."},
    {t:"Bredt's Rule",
     statement:"A bridged bicyclic ring system cannot have a carbon-carbon double bond at a bridgehead carbon, unless the rings involved are large enough to accommodate the resulting geometric strain.",
     terms:[],
     formulas:[],
     tip:"The bridgehead position simply can't achieve the planar geometry a double bond requires in small, rigid bicyclic frameworks — the strain would be too severe."},
    {t:"Cram's Rule",
     statement:"Predicts the major diastereomer formed when a nucleophile attacks a carbonyl group adjacent to a stereocentre, based on the preferred conformation (drawn as a Newman projection) that minimises steric interactions during the attack.",
     terms:[],
     formulas:[],
     tip:"An early, foundational model for predicting stereochemical outcomes in nucleophilic addition — later refined by more detailed models like the Felkin-Anh model."},
    {t:"Paneth-Fajans-Hahn Rule (Law of Adsorption)",
     statement:"A radioactive (or trace) ion is preferentially adsorbed onto the surface of a solid, such as a precipitate, if it can form a highly insoluble or only slightly dissociated compound with an ion already present on that surface.",
     terms:[],
     formulas:[],
     tip:"Originally developed to explain how trace amounts of radioactive isotopes behave during precipitation — still used today in radiochemistry and coprecipitation studies."}
  ]}
]);
