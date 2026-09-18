/* Formula Vault — Derivations · Class 12 · Mathematics */
window.FVDERIVATIONS = (window.FVDERIVATIONS || []).concat([
  {cls:"12", subject:"math", chapter:"Inverse Trigonometric Functions", derivations:[
    {t:"Proof that sin⁻¹x + cos⁻¹x = π/2",
     given:"Let sin⁻¹x = θ, where θ ∈ [−π/2, π/2] by definition of the principal value of sin⁻¹.",
     steps:[
       "Since sin⁻¹x = θ, we have x = sinθ",
       "Rewrite using a co-function identity: x = sinθ = cos(π/2 − θ)",
       "Since θ ∈ [−π/2, π/2], it follows that (π/2 − θ) ∈ [0, π] — exactly the principal value range of cos⁻¹",
       "So from x = cos(π/2−θ), taking cos⁻¹ of both sides gives cos⁻¹x = π/2 − θ",
       "Substitute back θ = sin⁻¹x"
     ],
     result:"sin⁻¹x + cos⁻¹x = π/2"}
  ]},  {cls:"12", subject:"math", chapter:"Differentiation", derivations:[
    {t:"Derivative of sinx from First Principles",
     given:"f(x) = sinx. By definition, f′(x) = lim(h→0) [f(x+h) − f(x)]/h.",
     steps:[
       "f′(x) = lim(h→0) [sin(x+h) − sinx] / h",
       "Use the sum-to-product identity: sin(x+h) − sinx = 2cos(x + h/2)·sin(h/2)",
       "So f′(x) = lim(h→0) [2cos(x+h/2)sin(h/2)] / h = lim(h→0) cos(x+h/2) × [sin(h/2)/(h/2)]",
       "As h→0: cos(x+h/2) → cosx, and sin(h/2)/(h/2) → 1 (the standard trigonometric limit)"
     ],
     result:"d/dx(sinx) = cosx"},
    {t:"Derivative of cosx from First Principles",
     given:"f(x) = cosx. By definition, f′(x) = lim(h→0) [f(x+h) − f(x)]/h.",
     steps:[
       "f′(x) = lim(h→0) [cos(x+h) − cosx] / h",
       "Use the sum-to-product identity: cos(x+h) − cosx = −2sin(x + h/2)·sin(h/2)",
       "So f′(x) = lim(h→0) [−2sin(x+h/2)sin(h/2)] / h = lim(h→0) −sin(x+h/2) × [sin(h/2)/(h/2)]",
       "As h→0: sin(x+h/2) → sinx, and sin(h/2)/(h/2) → 1 (the standard trigonometric limit)"
     ],
     result:"d/dx(cosx) = −sinx"},
    {t:"Derivative of xⁿ from First Principles",
     given:"f(x) = xⁿ. By definition, f′(x) = lim(h→0) [f(x+h) − f(x)]/h.",
     steps:[
       "f′(x) = lim(h→0) [(x+h)ⁿ − xⁿ] / h",
       "Expand (x+h)ⁿ using the binomial theorem: xⁿ + nx^(n−1)h + [n(n−1)/2]x^(n−2)h² + … + hⁿ",
       "Subtracting xⁿ leaves: nx^(n−1)h + (terms containing h² or higher powers)",
       "Divide by h: nx^(n−1) + (terms containing h or higher powers)",
       "As h → 0, every term containing h vanishes, leaving only the first term"
     ],
     result:"d/dx(xⁿ) = nx^(n−1)"}
  ]},  {cls:"12", subject:"math", chapter:"Integrals", derivations:[
    {t:"Derivation of Integration by Parts",
     given:"The product rule for differentiation: d/dx(uv) = u′v + uv′, where u and v are functions of x.",
     steps:[
       "Integrate both sides of the product rule with respect to x: uv = ∫u′v dx + ∫uv′ dx",
       "Rearrange to isolate the second integral: ∫uv′ dx = uv − ∫u′v dx",
       "Written with v′dx = dv and u′dx = du, this is the familiar ∫u dv = uv − ∫v du"
     ],
     result:"∫uv dx = u∫v dx − ∫[u′∫v dx] dx"},
    {t:"Derivation of ∫dx/(x²+a²) = (1/a)tan⁻¹(x/a) + C",
     given:"The standard integral ∫dx/(x²+a²), evaluated using the trigonometric substitution x = a·tanθ.",
     steps:[
       "Substitute x = a tanθ, so dx = a sec²θ dθ",
       "Also, x² + a² = a²tan²θ + a² = a²(tan²θ+1) = a²sec²θ",
       "Substitute both into the integral: ∫[a sec²θ dθ] / [a²sec²θ] = ∫(1/a) dθ",
       "Integrate: (1/a)θ + C",
       "Convert back to x using θ = tan⁻¹(x/a)"
     ],
     result:"∫dx/(x²+a²) = (1/a)tan⁻¹(x/a) + C"},
    {t:"Proof of King's Property of Definite Integrals",
     given:"The definite integral I = ∫(a to b) f(x)dx.",
     steps:[
       "Apply the substitution x = a+b−t, so dx = −dt. When x=a, t=b; when x=b, t=a",
       "I = ∫(b to a) f(a+b−t)(−dt) = ∫(a to b) f(a+b−t)dt (flipping the limits cancels the negative sign)",
       "Since t is just a dummy variable, rename it back to x"
     ],
     result:"∫(a to b) f(x)dx = ∫(a to b) f(a+b−x)dx"}
  ]},  {cls:"12", subject:"math", chapter:"Vectors & 3D Geometry", derivations:[
    {t:"Derivation of Shortest Distance Between Two Skew Lines",
     given:"Two skew (non-intersecting, non-parallel) lines: L1: r = a1 + λb1 and L2: r = a2 + μb2.",
     steps:[
       "The line of shortest distance must be perpendicular to both b1 and b2 simultaneously, so its direction is n = b1 × b2",
       "Take the vector joining any point on L1 to any point on L2: this is (a2 − a1)",
       "The shortest distance is the length of the projection of (a2 − a1) onto the common perpendicular direction n̂ = n/|n|",
       "Distance = |(a2 − a1)·n| / |n|"
     ],
     result:"d = |(a2 − a1)·(b1 × b2)| / |b1 × b2|"},
    {t:"Derivation of the Distance of a Point from a Plane",
     given:"A plane ax+by+cz+d=0 and a point (x1,y1,z1) not on the plane. The vector (a,b,c) is normal to the plane.",
     steps:[
       "The foot of perpendicular from (x1,y1,z1) to the plane lies along the normal direction (a,b,c), so it can be written as (x1+λa, y1+λb, z1+λc) for some scalar λ",
       "Since this point lies on the plane: a(x1+λa)+b(y1+λb)+c(z1+λc)+d=0, which gives λ = −(ax1+by1+cz1+d)/(a²+b²+c²)",
       "The distance equals |λ|×√(a²+b²+c²) (the length of the step taken along the unit normal)",
       "Substituting λ from above and simplifying"
     ],
     result:"d = |ax1+by1+cz1+d| / √(a²+b²+c²)"}
  ]},  {cls:"12", subject:"math", chapter:"Probability", derivations:[
    {t:"Derivation of Bayes' Theorem",
     given:"The definition of conditional probability, P(A|B) = P(A∩B)/P(B), applied to a set of mutually exclusive, exhaustive events A1, A2, …, An.",
     steps:[
       "By definition: P(Ai|B) = P(Ai∩B) / P(B)",
       "By the multiplication rule, P(Ai∩B) = P(B|Ai)·P(Ai)",
       "By the Law of Total Probability, since the Ai's are mutually exclusive and exhaustive: P(B) = Σj P(B|Aj)·P(Aj)",
       "Substitute both results into the definition from step 1"
     ],
     result:"P(Ai|B) = P(B|Ai)P(Ai) / Σj P(B|Aj)P(Aj)"}
  ]}
]);
