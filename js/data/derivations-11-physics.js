/* Formula Vault — Derivations · Class 11 · Physics */
window.FVDERIVATIONS = (window.FVDERIVATIONS || []).concat([
  {cls:"11", subject:"physics", chapter:"Motion in a Straight Line", derivations:[
    {t:"Derivation of v = u + at",
     given:"A body starts with initial velocity u and moves with constant acceleration a for time t.",
     steps:[
       "By definition, acceleration is the rate of change of velocity: a = dv/dt",
       "Rearranging and separating variables: dv = a·dt",
       "Integrate the left side from v=u to v=v, and the right side from t=0 to t=t: ∫(u→v) dv = a∫(0→t) dt",
       "Evaluating both integrals: v − u = a(t − 0)"
     ],
     result:"v = u + at"},
    {t:"Derivation of s = ut + ½at²",
     given:"Using v = u + at from the first equation, where v = ds/dt.",
     steps:[
       "Write velocity as the rate of change of displacement: ds/dt = u + at",
       "Separate variables: ds = (u + at)dt",
       "Integrate the left side from s=0 to s=s, and the right side from t=0 to t=t: ∫(0→s) ds = ∫(0→t) (u+at) dt",
       "Evaluating: s = ut + ½at²"
     ],
     result:"s = ut + ½at²"},
    {t:"Derivation of v² = u² + 2as",
     given:"Using the chain rule to write acceleration in terms of displacement instead of time.",
     steps:[
       "Acceleration a = dv/dt = (dv/ds)(ds/dt) = v(dv/ds), since ds/dt = v",
       "Separate variables: a·ds = v·dv",
       "Integrate the left side from s=0 to s=s, and the right side from v=u to v=v: a∫(0→s) ds = ∫(u→v) v dv",
       "Evaluating: as = ½(v² − u²)"
     ],
     result:"v² = u² + 2as"}
  ]},  {cls:"11", subject:"physics", chapter:"Motion in a Plane", derivations:[
    {t:"Derivation of Time of Flight (Projectile)",
     given:"A projectile launched with speed u at angle θ; vertical displacement y = u sinθ·t − ½gt².",
     steps:[
       "The projectile lands when it returns to the same vertical level, i.e. y = 0",
       "0 = u sinθ·t − ½gt², which factors as t(u sinθ − ½gt) = 0",
       "This gives t = 0 (the launch instant) or t = 2u sinθ/g (the landing instant)"
     ],
     result:"T = 2u sinθ / g"},
    {t:"Derivation of Maximum Height (Projectile)",
     given:"At maximum height, the vertical component of velocity momentarily becomes zero.",
     steps:[
       "Vertical velocity: vy = u sinθ − gt. Set vy = 0 to find the time to reach the top: t = u sinθ/g",
       "Substitute this t into y = u sinθ·t − ½gt²",
       "H = u sinθ·(u sinθ/g) − ½g·(u sinθ/g)² = u²sin²θ/g − u²sin²θ/2g"
     ],
     result:"H = u²sin²θ / 2g"},
    {t:"Derivation of Horizontal Range (Projectile)",
     given:"Range = horizontal velocity × total time of flight (horizontal velocity is unchanged throughout, since gravity acts only vertically).",
     steps:[
       "R = (u cosθ) × T, where T = 2u sinθ/g from the time-of-flight result",
       "R = u cosθ × (2u sinθ/g) = 2u²sinθ cosθ/g",
       "Using the identity 2sinθcosθ = sin2θ"
     ],
     result:"R = u²sin2θ / g"},
    {t:"Derivation of the Trajectory Equation (Projectile)",
     given:"A projectile launched with speed u at angle θ. Horizontal: x = (u cosθ)t. Vertical: y = (u sinθ)t − ½gt².",
     steps:[
       "From the horizontal equation, solve for time: t = x/(u cosθ)",
       "Substitute this into the vertical equation: y = u sinθ·[x/(u cosθ)] − ½g·[x/(u cosθ)]²",
       "Simplify the first term: u sinθ · x/(u cosθ) = x tanθ",
       "Simplify the second term: ½g·x²/(u²cos²θ)"
     ],
     result:"y = x tanθ − gx² / (2u²cos²θ)"},
    {t:"Derivation of Centripetal Acceleration",
     given:"A particle moves in a circle of radius r at constant speed v. Its velocity vector always stays perpendicular to its position vector.",
     steps:[
       "In a small time interval Δt, the particle sweeps a small angle Δθ = vΔt/r (since arc length = rΔθ = vΔt)",
       "Because the velocity vector is always perpendicular to the position vector, it rotates through this same small angle Δθ as the particle moves",
       "The velocity vector's magnitude stays v throughout, so the small change in velocity Δv (for small Δθ) has magnitude |Δv| ≈ v·Δθ (treating the tip of the rotating velocity vector as tracing a tiny arc of 'radius' v)",
       "Substitute Δθ = vΔt/r: |Δv| ≈ v·(vΔt/r) = v²Δt/r",
       "Acceleration a = lim(Δt→0) |Δv|/Δt = v²/r",
       "As Δt→0, the direction of Δv turns out to point exactly toward the centre of the circle"
     ],
     result:"ac = v²/r, directed toward the centre"}
  ]},  {cls:"11", subject:"physics", chapter:"Laws of Motion", derivations:[
    {t:"Derivation of Maximum Safe Speed on a Banked Road (Frictionless)",
     given:"A vehicle of mass m moves on a road banked at angle θ, radius of curvature r. Ignore friction.",
     steps:[
       "Two forces act: weight mg (vertically down) and Normal reaction N (perpendicular to the road surface)",
       "Resolve N into a vertical component N cosθ and a horizontal component N sinθ (directed toward the centre of the circular path)",
       "Vertical equilibrium (no vertical acceleration): N cosθ = mg",
       "The horizontal component provides the necessary centripetal force: N sinθ = mv²/r",
       "Divide the second equation by the first: tanθ = v²/(rg)"
     ],
     result:"v = √(rg tanθ)"}
  ]},  {cls:"11", subject:"physics", chapter:"Work, Energy & Power", derivations:[
    {t:"Derivation of the Work-Energy Theorem (Variable Force)",
     given:"A variable force F acts on a body of mass m along the x-direction, changing its velocity from v1 to v2 as it moves from x1 to x2.",
     steps:[
       "Work done: W = ∫(x1 to x2) F dx = ∫(x1 to x2) ma dx, using Newton's second law",
       "Write a = dv/dt, and use the chain rule trick: a = (dv/dt) = (dv/dx)(dx/dt) = v(dv/dx)",
       "Substitute: W = ∫(x1 to x2) m·v(dv/dx)·dx = ∫(v1 to v2) mv dv (the dx cancels, and limits convert from x to v)",
       "Integrate: W = m[v²/2] from v1 to v2 = ½mv2² − ½mv1²"
     ],
     result:"W(net) = ΔKE = ½mv2² − ½mv1²"},
    {t:"Derivation of Velocities After a 1D Elastic Collision",
     given:"Two bodies of masses m1, m2 with initial velocities u1, u2 undergo a perfectly elastic head-on collision, ending with velocities v1, v2.",
     steps:[
       "Conservation of momentum: m1u1 + m2u2 = m1v1 + m2v2, rearranged as m1(u1−v1) = m2(v2−u2)  …(i)",
       "Conservation of kinetic energy: m1(u1²−v1²) = m2(v2²−u2²), which factors as m1(u1−v1)(u1+v1) = m2(v2−u2)(v2+u2)  …(ii)",
       "Divide equation (ii) by equation (i): u1 + v1 = v2 + u2, which rearranges to u1 − u2 = v2 − v1  …(iii) — this says the velocity of approach equals the velocity of separation",
       "From (iii): v2 = u1 − u2 + v1. Substitute this into (i) and solve for v1",
       "This yields v1, and by the symmetric argument (swapping the labels 1↔2), v2 follows the same pattern"
     ],
     result:"v1 = [(m1−m2)u1 + 2m2u2]/(m1+m2), v2 = [(m2−m1)u2 + 2m1u1]/(m1+m2)"}
  ]},  {cls:"11", subject:"physics", chapter:"Moment of Inertia", derivations:[
    {t:"Derivation of the Parallel Axis Theorem",
     given:"A body of mass M with moment of inertia Icm about an axis through its centre of mass; a second axis is parallel to it, at distance d.",
     steps:[
       "For a particle of mass m at position vector r from the centre of mass, its position from the new axis is (r + d)",
       "I (about new axis) = Σm(r + d)² = Σm(r² + 2r·d + d²) = Σmr² + 2d·Σmr + d²Σm",
       "By definition, Σmr² = Icm (moment of inertia about the CM axis)",
       "Also by definition of centre of mass, Σmr = 0 (position vectors measured from the CM average to zero)",
       "And Σm = M, the total mass, so the middle term vanishes and the last term becomes Md²"
     ],
     result:"I = Icm + Md²"},
    {t:"Derivation of the Perpendicular Axis Theorem",
     given:"A flat (planar) lamina lying in the xy-plane, with the z-axis perpendicular to it through the same origin.",
     steps:[
       "For a particle at position (x, y) in the lamina, its distance from the z-axis is r = √(x² + y²)",
       "Moment of inertia about z-axis: Iz = Σm(x² + y²) = Σmx² + Σmy²",
       "By definition, the moment of inertia about the x-axis is Ix = Σmy² (distance from the x-axis is y), and about the y-axis is Iy = Σmx²",
       "Substituting: Iz = Iy + Ix"
     ],
     result:"Iz = Ix + Iy &nbsp; (valid only for a planar lamina)"},
    {t:"Derivation of MOI of a Uniform Rod (About Centre)",
     given:"A thin uniform rod of mass M and length L, linear mass density λ = M/L. Axis through the centre, perpendicular to the rod.",
     steps:[
       "Consider a small element of the rod of length dx, at distance x from the centre. Its mass is dm = λ dx",
       "This element's contribution to the moment of inertia: dI = dm·x² = λx² dx",
       "Integrate over the full length of the rod, from x = −L/2 to x = +L/2: I = ∫(−L/2 to L/2) λx² dx",
       "I = λ[x³/3] from −L/2 to L/2 = λ[(L³/24) − (−L³/24)] = λL³/12",
       "Substitute λ = M/L: I = (M/L)(L³/12)"
     ],
     result:"I = ML²/12"},
    {t:"Derivation of MOI of a Uniform Disc (About Central Axis)",
     given:"A uniform disc of mass M and radius R, surface mass density σ = M/(πR²). Axis through the centre, perpendicular to the disc's plane.",
     steps:[
       "Consider a thin ring element of the disc, at radius r from the centre, with thickness dr. Its area is 2πr·dr, so its mass is dm = σ·2πr dr",
       "Since every point on this thin ring is at the same distance r from the axis, its contribution to the moment of inertia is dI = dm·r² = 2πσr³ dr",
       "Integrate over the whole disc, from r = 0 to r = R: I = ∫(0 to R) 2πσr³ dr",
       "I = 2πσ[r⁴/4] from 0 to R = 2πσR⁴/4 = πσR⁴/2",
       "Substitute σ = M/(πR²): I = π(M/πR²)(R⁴/2) = MR²/2"
     ],
     result:"I = MR²/2"}
  ]},  {cls:"11", subject:"physics", chapter:"Gravitation", derivations:[
    {t:"Derivation of Escape Velocity",
     given:"The minimum speed needed to just escape a planet's gravity is the speed for which total mechanical energy (KE + PE) equals zero at infinity.",
     steps:[
       "Total energy at the surface: E = ½mve² − GMm/R",
       "For the object to just escape (reach infinity with zero residual velocity), total energy must equal zero: ½mve² − GMm/R = 0",
       "Solving for ve²: ve² = 2GM/R"
     ],
     result:"ve = √(2GM/R)"},
    {t:"Derivation of Kepler's Third Law (from gravitation)",
     given:"A satellite of mass m orbits a planet of mass M in a circular orbit of radius r; gravity supplies the required centripetal force.",
     steps:[
       "Equate gravitational force to centripetal force: GMm/r² = mv²/r",
       "Simplify: v² = GM/r, so orbital speed v = √(GM/r)",
       "Time period T = (circumference)/(speed) = 2πr/v = 2πr/√(GM/r) = 2πr^(3/2)/√(GM)",
       "Squaring both sides: T² = 4π²r³/GM"
     ],
     result:"T²/r³ = 4π²/GM &nbsp; (Kepler's Third Law)"},
    {t:"Derivation of Variation of g with Height and Depth",
     given:"g = GM/R² at the surface of a planet of radius R and mass M (assumed uniform density).",
     steps:[
       "At height h above the surface: g' = GM/(R+h)². Dividing by g = GM/R²: g'/g = R²/(R+h)² = (1 + h/R)⁻²",
       "For h ≪ R, apply the binomial approximation (1+x)ⁿ ≈ 1+nx: g'/g ≈ 1 − 2h/R, so g' ≈ g(1 − 2h/R)",
       "At depth d below the surface, only the mass enclosed within radius (R−d) contributes to gravity there (the shell outside contributes zero net field). For uniform density, this enclosed mass is M' = M×(R−d)³/R³",
       "g' = GM'/(R−d)² = GM(R−d)³ / [R³(R−d)²] = GM(R−d)/R³ = [GM/R²]×[(R−d)/R]"
     ],
     result:"gh ≈ g(1 − 2h/R); gd = g(1 − d/R)"}
  ]},  {cls:"11", subject:"physics", chapter:"Mechanical Properties of Fluids", derivations:[
    {t:"Derivation of the Ascent Formula (Capillary Rise)",
     given:"A capillary tube of radius r dipped into a liquid of density ρ and surface tension T, with angle of contact θ. Liquid rises to height h.",
     steps:[
       "At equilibrium, the weight of the risen liquid column is balanced by the vertical component of the surface tension force acting around the circumference of the tube",
       "Weight of the liquid column: W = (volume)×(density)×g = (πr²h)×ρ×g",
       "Surface tension force acts along the circumference (length 2πr) at angle θ to the vertical wall; its vertical component is: F = T×(2πr)×cosθ",
       "Equating the two: πr²hρg = 2πrT cosθ",
       "Cancel πr from both sides and solve for h"
     ],
     result:"h = 2T cosθ / (rρg)"},
    {t:"Derivation of Terminal Velocity (Using Stokes' Law)",
     given:"A small sphere of radius r and density ρ falls through a viscous fluid of density σ and viscosity η. At terminal velocity, the net force on it is zero.",
     steps:[
       "Three forces act: weight (down), buoyant force (up), and viscous drag (up, opposing motion)",
       "Weight: W = (4/3)πr³ρg. Buoyant force: Fb = (4/3)πr³σg. Viscous force (Stokes' Law): Fv = 6πηrv",
       "At terminal velocity, net force = 0: W = Fb + Fv",
       "(4/3)πr³ρg = (4/3)πr³σg + 6πηrv",
       "(4/3)πr³g(ρ−σ) = 6πηrv",
       "Solve for v by dividing both sides by 6πηr"
     ],
     result:"vt = 2r²(ρ−σ)g / (9η)"},
    {t:"Derivation of Bernoulli's Theorem",
     given:"An ideal (non-viscous, incompressible) fluid flows steadily through a pipe of varying cross-section, from point 1 (area A1, pressure P1, height h1, speed v1) to point 2 (A2, P2, h2, v2), using the work-energy theorem.",
     steps:[
       "By the equation of continuity, the same volume ΔV of fluid enters at point 1 as leaves at point 2 in a given time interval",
       "Work done by the pressure force pushing fluid in at point 1: W1 = P1·A1·(v1Δt) = P1·ΔV. Work done against the pressure force at point 2: W2 = P2·ΔV",
       "Net work done on the fluid element by pressure forces: W = (P1−P2)ΔV",
       "By the work-energy theorem, this net work equals the change in kinetic energy plus the change in potential energy of the fluid element (mass Δm = ρΔV): W = [½Δm v2² − ½Δm v1²] + [Δm g h2 − Δm g h1]",
       "Substitute Δm = ρΔV and divide throughout by ΔV: P1 − P2 = ½ρ(v2²−v1²) + ρg(h2−h1)",
       "Rearrange so that all point-1 quantities are on one side and point-2 quantities on the other"
     ],
     result:"P + ½ρv² + ρgh = constant, along a streamline"}
  ]},  {cls:"11", subject:"physics", chapter:"Kinetic Theory of Gases", derivations:[
    {t:"Derivation of Pressure of an Ideal Gas",
     given:"N molecules of mass m each, inside a cubical container of side L, moving randomly and colliding elastically with the walls.",
     steps:[
       "Consider one molecule with x-velocity component vx hitting the wall perpendicular to the x-axis. Since the collision is elastic, its momentum change per collision is 2mvx",
       "Time between successive collisions with the same wall is 2L/vx, so this molecule delivers momentum at rate mvx²/L (force from one molecule)",
       "Summing over all N molecules: total force = (m/L)Σvx² = (mN/L)⟨vx²⟩",
       "By symmetry of random motion, ⟨vx²⟩ = ⟨vy²⟩ = ⟨vz²⟩ = ⅓⟨v²⟩",
       "Pressure = Force/Area = [(mN/L)(⅓⟨v²⟩)] / L² = Nm⟨v²⟩/3L³ = Nm⟨v²⟩/3V (since V = L³)",
       "Since ρ = Nm/V is the gas density, this becomes P = ⅓ρ⟨v²⟩"
     ],
     result:"P = ⅓ρv²rms"}
  ]},  {cls:"11", subject:"physics", chapter:"Thermodynamics", derivations:[
    {t:"Derivation of Mayer's Formula (Cp − Cv = R)",
     given:"One mole of an ideal gas, whose internal energy U depends only on temperature (dU = CvdT, always, for an ideal gas).",
     steps:[
       "At constant volume, no work is done (dW=0), so the first law gives: dQ = dU = CvdT, meaning the heat supplied at constant V defines Cv",
       "At constant pressure, the first law gives: dQ = dU + PdV = CvdT + PdV, and by definition this heat supplied at constant P defines Cp: CpdT = CvdT + PdV",
       "For 1 mole of ideal gas, PV=RT. At constant pressure, differentiate: PdV = RdT",
       "Substitute: CpdT = CvdT + RdT",
       "Divide through by dT"
     ],
     result:"Cp − Cv = R"},
    {t:"Derivation of Work Done in Isothermal Expansion",
     given:"n moles of an ideal gas expand reversibly and isothermally (constant T) from volume V1 to V2.",
     steps:[
       "Work done by the gas: W = ∫(V1 to V2) P dV",
       "For an ideal gas, P = nRT/V. Since T is constant, substitute directly: W = ∫(V1 to V2) (nRT/V) dV",
       "Since n, R, T are all constant, pull them out of the integral: W = nRT ∫(V1 to V2) dV/V = nRT[lnV] from V1 to V2"
     ],
     result:"W = nRT ln(V2/V1)"},
    {t:"Derivation of Work Done in Adiabatic Expansion",
     given:"An ideal gas expands reversibly and adiabatically from (P1,V1) to (P2,V2), obeying PVᵞ = constant = K.",
     steps:[
       "Work done: W = ∫(V1 to V2) P dV, with P = K/Vᵞ (from PVᵞ=K)",
       "W = ∫(V1 to V2) K·V⁻ᵞ dV = K[V^(1−γ)/(1−γ)] from V1 to V2",
       "W = [K·V2^(1−γ) − K·V1^(1−γ)] / (1−γ)",
       "Since K = P1V1ᵞ = P2V2ᵞ, substitute back: K·V2^(1−γ) = P2V2ᵞ·V2^(1−γ) = P2V2, and similarly K·V1^(1−γ) = P1V1",
       "So W = (P2V2 − P1V1)/(1−γ) = (P1V1 − P2V2)/(γ−1)"
     ],
     result:"W = (P1V1 − P2V2) / (γ−1)"}
  ]},  {cls:"11", subject:"physics", chapter:"Oscillations", derivations:[
    {t:"Derivation of Time Period of a Spring-Mass System",
     given:"A block of mass m attached to a spring of force constant k, displaced by x from its equilibrium position on a frictionless surface.",
     steps:[
       "By Hooke's Law, the restoring force is F = −kx (negative sign shows it opposes the displacement)",
       "By Newton's second law: ma = −kx, so a = −(k/m)x",
       "Compare with the standard SHM equation a = −ω²x: matching coefficients gives ω² = k/m, so ω = √(k/m)",
       "Time period T = 2π/ω"
     ],
     result:"T = 2π√(m/k)"},
    {t:"Derivation of Time Period of a Simple Pendulum",
     given:"A bob of mass m on a string of length L, displaced through a small angle θ from the vertical.",
     steps:[
       "The restoring force along the arc is the tangential component of gravity: F = −mg sinθ",
       "For small angles, sinθ ≈ θ = x/L, where x is the arc-length displacement from the mean position",
       "So F ≈ −(mg/L)x — this matches the SHM form F = −kx with effective 'spring constant' k = mg/L",
       "For SHM, ω² = k/m, so ω² = g/L, giving ω = √(g/L)",
       "Time period T = 2π/ω"
     ],
     result:"T = 2π√(L/g)"}
  ]},  {cls:"11", subject:"physics", chapter:"Waves", derivations:[
    {t:"Derivation of Standing Wave Frequencies (String, Both Ends Fixed)",
     given:"A string of length L fixed at both ends; both endpoints must be nodes of any standing wave that forms.",
     steps:[
       "Consecutive nodes of a standing wave are separated by half a wavelength (λ/2)",
       "For both ends to be nodes, the string length must be a whole-number multiple of λ/2: L = nλ/2, where n = 1, 2, 3, …",
       "Solving for wavelength: λ = 2L/n",
       "Using v = fλ, frequency f = v/λ = v/(2L/n) = nv/2L"
     ],
     result:"fn = nv / 2L"},
    {t:"Derivation of Speed of a Transverse Wave on a Stretched String",
     given:"The wave speed v on a stretched string can only depend on the tension T and the linear mass density μ (mass per unit length) — the only two relevant physical quantities of the string itself.",
     steps:[
       "Assume v = k·Tᵃ·μᵇ for some dimensionless constant k and unknown powers a, b",
       "Write the dimensions of each quantity: [v] = LT⁻¹, [T] = MLT⁻², [μ] = ML⁻¹",
       "Substitute into the assumed relation: LT⁻¹ = (MLT⁻²)ᵃ(ML⁻¹)ᵇ = M^(a+b)L^(a−b)T^(−2a)",
       "Match powers on both sides — for M: a+b=0; for L: a−b=1; for T: −2a=−1",
       "Solving: a = 1/2, and then b = −1/2",
       "So v = k√(T/μ); a full treatment of the wave equation on a string confirms the constant k = 1"
     ],
     result:"v = √(T/μ)"},
    {t:"Newton's Formula for Speed of Sound and Laplace's Correction",
     given:"Sound travels through a gas as a series of compressions and rarefactions, and the speed of any wave in a medium is v=√(B/ρ), where B is the medium's bulk modulus.",
     steps:[
       "Newton assumed sound propagation is slow enough for the gas to stay at constant temperature (isothermal), so PV = constant applies, giving isothermal bulk modulus B = P",
       "This gives Newton's formula: v = √(P/ρ) — but this predicts a speed of sound in air about 20% lower than what is measured experimentally",
       "Laplace corrected this by arguing that compressions and rarefactions in a sound wave happen too rapidly for heat to be exchanged between adjacent gas layers — the process is actually adiabatic, not isothermal",
       "For an adiabatic process, PVᵞ = constant, which gives the adiabatic bulk modulus B = γP instead of just P",
       "Substituting the adiabatic bulk modulus into v=√(B/ρ) gives the corrected result, which matches experimental values closely"
     ],
     result:"v = √(γP/ρ) &nbsp; (Laplace's corrected formula)"},
    {t:"Derivation of the Doppler Effect (Source Approaching a Stationary Observer)",
     given:"A source emits sound of frequency f (period T=1/f) while moving toward a stationary observer with speed vs. Sound travels at speed v in the medium.",
     steps:[
       "Consider two consecutive wavefronts, emitted at t=0 and t=T (one full period apart)",
       "By the time the source emits the second wavefront (at t=T), it has moved a distance vsT closer to the observer",
       "In this same time T, the first wavefront has travelled a distance vT from the source's original position",
       "The distance between the two wavefronts (the apparent wavelength λ′ perceived by the observer) is therefore reduced: λ′ = vT − vsT = (v−vs)T",
       "The apparent frequency is f′ = v/λ′ = v / [(v−vs)T], and since T=1/f, this becomes f′ = fv/(v−vs)"
     ],
     result:"f′ = fv / (v − vs)"},
    {t:"Derivation of Beat Frequency",
     given:"Two sound waves of equal amplitude A and close (but different) frequencies f1 and f2, superposing at a point: y1 = A sin(2πf1t), y2 = A sin(2πf2t).",
     steps:[
       "By the principle of superposition, the resultant displacement is y = y1 + y2 = A[sin(2πf1t) + sin(2πf2t)]",
       "Apply the sum-to-product identity: y = 2A cos[2π(f1−f2)t/2] · sin[2π(f1+f2)t/2]",
       "This represents a wave of frequency (f1+f2)/2 (essentially the average of the two, barely changed) whose amplitude is modulated by the slowly-varying envelope term 2A cos[2π(f1−f2)t/2]",
       "Loudness is maximum whenever this envelope term reaches its maximum magnitude (+1 or −1), which happens twice in every full cycle of the cosine term",
       "The cosine term itself has frequency (f1−f2)/2, so its magnitude peaks occur at twice that rate"
     ],
     result:"Beat frequency = |f1 − f2|"}
  ]},
]);
