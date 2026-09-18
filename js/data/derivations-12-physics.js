/* Formula Vault — Derivations · Class 12 · Physics */
window.FVDERIVATIONS = (window.FVDERIVATIONS || []).concat([
  {cls:"12", subject:"physics", chapter:"Electrostatics", derivations:[
    {t:"Derivation of Electric Field on the Axial Line of a Dipole",
     given:"A dipole with charges +q and −q separated by distance 2a; point P lies on the axial line at distance r from the centre, on the +q side.",
     steps:[
       "Distance from P to +q is (r − a); distance from P to −q is (r + a)",
       "Field due to +q at P (pointing away from the dipole): E+ = kq/(r−a)²",
       "Field due to −q at P (pointing toward the dipole, i.e. same direction as E+ here): E− = kq/(r+a)²",
       "Net field: E = k q [1/(r−a)² − 1/(r+a)²] = kq[(r+a)² − (r−a)²] / [(r−a)²(r+a)²] = kq(4ar)/(r²−a²)²",
       "Since dipole moment p = q(2a): E = 2kpr/(r²−a²)²",
       "For a short dipole (r ≫ a), (r²−a²)² ≈ r⁴, giving E ≈ 2kp/r³"
     ],
     result:"Eaxial ≈ (1/4πε0)(2p/r³) &nbsp; for r ≫ a"},
    {t:"Derivation of Electric Field on the Equatorial Line of a Dipole",
     given:"A dipole with charges +q and −q separated by distance 2a; point P lies on the equatorial line (perpendicular bisector) at distance r from the centre.",
     steps:[
       "By symmetry, P is equidistant from both charges: distance = √(r²+a²)",
       "Each charge contributes a field of equal magnitude E = kq/(r²+a²) at P, but pointing in different directions (away from +q, toward −q)",
       "Resolve each field into components parallel and perpendicular to the dipole axis — the perpendicular components cancel by symmetry, and the parallel (axis-directed) components add",
       "Each field's component along the axis is E·cosα, where cosα = a/√(r²+a²)",
       "Net field: Enet = 2E cosα = 2·[kq/(r²+a²)]·[a/√(r²+a²)] = 2kqa/(r²+a²)^(3/2) = kp/(r²+a²)^(3/2), using p=2qa",
       "For a short dipole (r≫a): (r²+a²)^(3/2) ≈ r³"
     ],
     result:"Eequatorial ≈ (1/4πε0)(p/r³) &nbsp; for r ≫ a — exactly half the axial field"},
    {t:"Derivation of Torque on a Dipole in a Uniform Field",
     given:"A dipole of moment p = q(2a) placed in a uniform electric field E, making angle θ with the field direction.",
     steps:[
       "Forces qE (on +q) and −qE (on −q) act in opposite directions, forming a couple — they don't cancel as a torque even though they cancel as a net force",
       "The perpendicular distance between the two lines of action of this force couple is (2a)sinθ",
       "Torque of a couple = one force × perpendicular distance between them: τ = qE × (2a sinθ)",
       "Group terms: τ = (q·2a)·E·sinθ = p·E·sinθ, using p=2qa"
     ],
     result:"τ = pE sinθ"},
    {t:"Derivation of Electric Potential due to a Dipole",
     given:"A dipole with charges +q, −q separated by 2a; point P at distance r from the centre, at angle θ from the dipole axis, with r ≫ a.",
     steps:[
       "V at P = kq/r+ − kq/r−, where r+ and r− are distances from P to +q and −q respectively",
       "Using the approximation valid for r≫a: r+ ≈ r − a cosθ, and r− ≈ r + a cosθ",
       "V = kq[1/(r−acosθ) − 1/(r+acosθ)]",
       "Using the binomial approximation 1/(r∓acosθ) ≈ (1/r)(1±(acosθ/r)) for a≪r: V ≈ kq[(1/r)(1+acosθ/r) − (1/r)(1−acosθ/r)] = kq(2acosθ)/r²",
       "Substitute p = 2qa"
     ],
     result:"V = (1/4πε0)(p cosθ)/r²"},
    {t:"Derivation of Electric Field due to an Infinitely Long Charged Wire (Gauss's Law)",
     given:"An infinitely long straight wire with uniform linear charge density λ. Find the field at perpendicular distance r from the wire.",
     steps:[
       "Choose a cylindrical Gaussian surface of radius r and length L, coaxial with the wire",
       "By symmetry, E is radially outward and has the same magnitude everywhere on the curved surface; the flux through the two flat end-caps is zero (E is parallel to these surfaces there)",
       "Flux through the curved surface: Φ = E × (2πrL)",
       "Charge enclosed: qenc = λL",
       "Apply Gauss's Law: E×2πrL = λL/ε0"
     ],
     result:"E = λ / (2πε0r)"},
    {t:"Derivation of Electric Field due to a Charged Infinite Plane Sheet (Gauss's Law)",
     given:"An infinite plane sheet with uniform surface charge density σ. Find the field at a point near the sheet.",
     steps:[
       "Choose a cylindrical 'pillbox' Gaussian surface that straddles the sheet symmetrically, with its two flat faces (each of area A) parallel to the sheet",
       "By symmetry, E is perpendicular to the sheet, pointing away from it on both sides, with equal magnitude at both faces",
       "Flux through the two flat faces: Φ = EA + EA = 2EA. Flux through the curved side surface is zero (E is parallel to it there)",
       "Charge enclosed: qenc = σA",
       "Apply Gauss's Law: 2EA = σA/ε0"
     ],
     result:"E = σ / (2ε0)"},
    {t:"Derivation of Capacitance of a Parallel Plate Capacitor",
     given:"Two parallel plates of area A separated by distance d, with charge Q and −Q, treated as infinite sheets so the field between them is uniform.",
     steps:[
       "Field between the plates (from the infinite-sheet result, doubled since both plates contribute): E = σ/ε0 = Q/(ε0A)",
       "Potential difference V = E·d (uniform field over separation d): V = Qd/(ε0A)",
       "Capacitance is defined as C = Q/V"
     ],
     result:"C = ε0A / d"},
    {t:"Derivation of Capacitance with a Dielectric Inserted",
     given:"A parallel plate capacitor (capacitance C0 = ε0A/d without dielectric) has a dielectric slab of dielectric constant K inserted, completely filling the gap.",
     steps:[
       "Inside a dielectric, the field reduces by a factor of K compared to the field in vacuum for the same free charge: E = E0/K",
       "Since V = E×d, the new voltage for the same charge Q is V = V0/K, where V0 = Q/C0 was the original voltage",
       "Capacitance is defined as C = Q/V = Q/(V0/K) = K(Q/V0) = K·C0"
     ],
     result:"C = Kε0A/d = KC0"},
    {t:"Derivation of Energy Stored in a Capacitor",
     given:"A capacitor of capacitance C is charged from 0 to a final charge Q by transferring charge in small increments.",
     steps:[
       "At some intermediate stage, when charge q has already been transferred, the potential difference is V=q/C. The work needed to transfer the next small charge dq is dW = V dq = (q/C)dq",
       "Total work done to charge the capacitor from 0 to Q: W = ∫(0 to Q) (q/C) dq = (1/C)[q²/2] from 0 to Q = Q²/(2C)",
       "This work is stored as electrical potential energy in the capacitor. Using Q=CV, this can also be written as U = ½CV²"
     ],
     result:"U = Q²/(2C) = ½CV²"}
  ]},  {cls:"12", subject:"physics", chapter:"Current Electricity", derivations:[
    {t:"Derivation of Equivalent Resistance — Series and Parallel",
     given:"Resistors R1, R2, … combined either in series (same current through each) or in parallel (same voltage across each).",
     steps:[
       "Series: the same current I flows through every resistor. Total voltage across the combination: V = V1+V2+⋯ = IR1+IR2+⋯ = I(R1+R2+⋯). Since V=IReq by definition, Req = R1+R2+⋯",
       "Parallel: the same voltage V appears across every resistor. Total current drawn: I = I1+I2+⋯ = V/R1+V/R2+⋯ = V(1/R1+1/R2+⋯). Since I=V/Req by definition, 1/Req = 1/R1+1/R2+⋯"
     ],
     result:"Series: Req = R1+R2+⋯; &nbsp; Parallel: 1/Req = 1/R1+1/R2+⋯"},
    {t:"Derivation of I = nAev(d) (Drift Velocity Relation)",
     given:"A conductor of cross-sectional area A with n free electrons per unit volume, each moving with average drift speed vd.",
     steps:[
       "In a small time Δt, electrons travel an average distance vd·Δt along the conductor",
       "Volume of conductor swept through in this time: A × (vd·Δt)",
       "Number of free electrons in this volume: n × A × vd·Δt",
       "Total charge crossing a cross-section in time Δt: ΔQ = (n·A·vd·Δt)·e",
       "Current I = ΔQ/Δt"
     ],
     result:"I = nAevd"},
    {t:"Derivation of the Wheatstone Bridge Balance Condition",
     given:"A bridge with resistances P, Q, R, S in its four arms, a galvanometer between the midpoints, and a battery driving current through the network. At balance, no current flows through the galvanometer.",
     steps:[
       "Since no current flows through the galvanometer at balance, the same current I1 flows through both P and Q, and the same current I2 flows through both R and S",
       "No current through the galvanometer also means the two midpoints (call them B and D) are at the same potential: VB = VD",
       "Along the P–Q path: VA − VB = I1P and VA − VD = I2R. Since VB = VD: I1P = I2R  …(i)",
       "Along the same branches to the far end C: VB − VC = I1Q and VD − VC = I2S. Since VB = VD: I1Q = I2S  …(ii)",
       "Dividing equation (i) by equation (ii): P/Q = R/S"
     ],
     result:"P/Q = R/S"}
  ]},  {cls:"12", subject:"physics", chapter:"Magnetism & Electromagnetic Induction", derivations:[
    {t:"Derivation of Magnetic Field at the Centre of a Circular Loop",
     given:"A circular loop of radius R carrying current I. By the Biot–Savart law, dB = (μ0/4π)(I·dl × r̂)/r².",
     steps:[
       "At the centre, every current element dl is at the same distance r = R, and dl is always perpendicular to r̂ (tangential vs radial)",
       "So |dl × r̂| = dl, and each element contributes dB = (μ0/4π)(I·dl)/R², all pointing in the same direction (along the axis)",
       "Integrate around the full loop: B = ∫dB = (μ0I)/(4πR²) ∫dl = (μ0I)/(4πR²) × (2πR)"
     ],
     result:"B = μ0I / 2R"},
    {t:"Derivation of Magnetic Field on the Axis of a Circular Loop",
     given:"A circular loop of radius R carrying current I. Find B at a point P on the axis, at distance x from the centre.",
     steps:[
       "Each current element dl is at distance √(R²+x²) from P. By the Biot–Savart law, it contributes dB = (μ0/4π)·I dl/(R²+x²), directed perpendicular to the line joining the element to P",
       "By symmetry, the components of dB perpendicular to the axis cancel out in pairs around the loop; only the components along the axis survive",
       "The axial component of each dB is dB·cosα, where cosα = R/√(R²+x²)",
       "Integrate around the loop: B = ∮dB cosα = [μ0I/(4π(R²+x²))]×[R/√(R²+x²)] × ∮dl = [μ0I R/(4π(R²+x²)^(3/2))] × 2πR"
     ],
     result:"B = μ0IR² / [2(R²+x²)^(3/2)]"},
    {t:"Derivation of Magnetic Field of a Long Straight Wire (Ampere's Law)",
     given:"A long straight wire carrying current I. Find B at perpendicular distance r from the wire.",
     steps:[
       "Choose an Amperian loop: a circle of radius r, centred on and perpendicular to the wire",
       "By symmetry, B is tangential to this circle and has the same magnitude everywhere on it",
       "Apply Ampere's Circuital Law: ∮B·dl = B×(2πr) = μ0Ienc = μ0I"
     ],
     result:"B = μ0I / (2πr)"},
    {t:"Derivation of Magnetic Field Inside a Long Solenoid (Ampere's Law)",
     given:"A long solenoid with n turns per unit length, carrying current I.",
     steps:[
       "Choose a rectangular Amperian loop: one long side of length L lies inside the solenoid, parallel to its axis; the opposite side lies far outside, where B≈0; the two short sides are perpendicular to the field, contributing nothing to the line integral",
       "Only the inside segment contributes to the line integral: ∮B·dl = B×L",
       "Current enclosed by this loop: the loop encloses nL turns, each carrying current I, so Ienc = nLI",
       "Apply Ampere's Law: B×L = μ0×nLI"
     ],
     result:"B = μ0nI"},
    {t:"Derivation of Force Between Two Parallel Current-Carrying Wires",
     given:"Two long parallel wires separated by distance d, carrying currents I1 and I2.",
     steps:[
       "Wire 1 produces a magnetic field at the location of wire 2, of magnitude B1 = μ0I1/(2πd)",
       "This field exerts a force on wire 2 (length L, carrying current I2): F = B1×I2×L",
       "Substitute B1"
     ],
     result:"F/L = μ0I1I2 / (2πd)"},
    {t:"Derivation of Self-Inductance of a Long Solenoid",
     given:"A solenoid of N turns, length l, cross-sectional area A, carrying current I. Inside field B = μ0nI, where n = N/l.",
     steps:[
       "Flux through a single turn: Φ1 = B×A = μ0nI×A",
       "Total flux linkage through all N turns: NΦ1 = N×μ0nIA = (nl)×μ0nIA = μ0n²IAl, using N=nl",
       "Self-inductance is defined by the relation: total flux linkage = LI, so L = μ0n²Al",
       "Since n = N/l, this can equivalently be written using N directly"
     ],
     result:"L = μ0n²Al = μ0N²A/l"},
    {t:"Derivation of Torque on a Current Loop in a Magnetic Field",
     given:"A rectangular loop of sides a and b, N turns, carrying current I, placed in field B with its normal at angle θ to B.",
     steps:[
       "The two sides of length b experience forces of magnitude F = BIb, equal and opposite, forming a couple",
       "The perpendicular distance between these two forces (the moment arm) is a·sinθ",
       "Torque of the couple = Force × moment arm = (BIb)(a sinθ) = BIA sinθ, where A = ab",
       "For N turns, each contributes equally, so multiply by N"
     ],
     result:"τ = NIAB sinθ"},
    {t:"Derivation of Motional EMF (ε = Bvl)",
     given:"A conducting rod of length l moves with velocity v, perpendicular to both its length and a uniform field B.",
     steps:[
       "A free electron in the rod experiences a magnetic force F = e(v × B), pushing charge to one end of the rod",
       "Charge keeps separating until the resulting electric field E inside the rod exerts an equal and opposite force: eE = evB, so E = vB",
       "EMF is defined as the work done per unit charge moving through this field along the rod's length: ε = E × l"
     ],
     result:"ε = Bvl"}
  ]},  {cls:"12", subject:"physics", chapter:"Alternating Current", derivations:[
    {t:"Derivation of Impedance in a Series LCR Circuit (Phasor Method)",
     given:"A resistor R, inductor L, and capacitor C connected in series to an AC source V=V0sinωt, carrying a common current I=I0sin(ωt−φ).",
     steps:[
       "Voltage across R: VR=IR, in phase with the current — drawn along the current-phasor direction",
       "Voltage across L: VL=IXL, leading the current by 90° — drawn perpendicular, rotated +90°",
       "Voltage across C: VC=IXC, lagging the current by 90° — drawn perpendicular, rotated −90° (opposite to VL)",
       "Since VL and VC point in exactly opposite directions on the phasor diagram, their net effect is a single phasor of magnitude (VL−VC)",
       "This net reactive phasor (VL−VC) is perpendicular to VR, so by the Pythagorean theorem, the source voltage amplitude is: V0² = VR² + (VL−VC)²",
       "Substitute VR=I0R, VL=I0XL, VC=I0XC: V0² = I0²R² + I0²(XL−XC)², so V0 = I0√(R²+(XL−XC)²) = I0Z"
     ],
     result:"Z = √(R² + (XL−XC)²); tanφ = (XL−XC)/R"},
    {t:"Derivation of Resonant Frequency of an LCR Circuit",
     given:"A series LCR circuit, with impedance Z = √(R²+(XL−XC)²).",
     steps:[
       "Impedance Z is minimum (equal to just R) when the reactive term vanishes, i.e. when XL = XC",
       "Substitute XL=ωL and XC=1/(ωC): ωL = 1/(ωC)",
       "Solve for ω: ω² = 1/(LC)"
     ],
     result:"ω0 = 1/√(LC)"}
  ]},  {cls:"12", subject:"physics", chapter:"Ray & Wave Optics", derivations:[
    {t:"Derivation of the Mirror Formula",
     given:"A concave mirror forms a real image; using similar triangles from the ray diagram (object AB, image A′B′, pole P, focus F).",
     steps:[
       "From the ray through the pole P, triangles ABP and A′B′P are similar: A′B′/AB = PB′/PB = v/u (using magnitudes)",
       "From the ray that travels parallel to the axis and reflects through F, triangles are similar in a way that gives: A′B′/AB = (PB′ − PF)/PF = (v − f)/f",
       "Equate the two expressions for A′B′/AB: v/u = (v − f)/f",
       "Cross-multiply: vf = u(v − f) = uv − uf, so vf + uf = uv",
       "Divide throughout by uvf: 1/u + 1/v = 1/f"
     ],
     result:"1/v + 1/u = 1/f"},
    {t:"Derivation of the Lens Maker's Formula",
     given:"A thin lens with two spherical surfaces of radii R1 and R2, refractive index n relative to the surrounding medium (air).",
     steps:[
       "Apply the single-spherical-surface refraction formula at the first surface (object in air, refracting into the lens): n/v1 − 1/u = (n − 1)/R1",
       "Apply the same formula at the second surface, treating the first image (at v1) as the object for this surface (ray now exits the lens back into air): 1/v − n/v1 = (1 − n)/R2",
       "Add the two equations — the n/v1 terms cancel: 1/v − 1/u = (n−1)/R1 + (1−n)/R2 = (n−1)(1/R1 − 1/R2)",
       "For an object at infinity, the image forms at the focus, so v = f"
     ],
     result:"1/f = (n − 1)(1/R1 − 1/R2)"},
    {t:"Derivation of the Prism Formula (δ = i + e − A)",
     given:"A ray enters a prism of refracting angle A at incidence angle i, refracts to r1 inside, hits the second face at r2, and exits at angle e.",
     steps:[
       "At the first surface, the ray bends by an angle (i − r1); at the second surface, it bends by a further (e − r2)",
       "Total deviation is the sum of these two individual deviations: δ = (i − r1) + (e − r2) = (i + e) − (r1 + r2)",
       "From the geometry of the quadrilateral formed by the two normals and the two refracting surfaces inside the prism, the angles work out to r1 + r2 = A"
     ],
     result:"δ = i + e − A"},
    {t:"Derivation of Refractive Index of a Prism at Minimum Deviation",
     given:"A prism of refracting angle A. At the angle of minimum deviation δm, the ray path through the prism becomes symmetric.",
     steps:[
       "At minimum deviation, the ray inside the prism travels parallel to the base, making the path symmetric: the angle of incidence equals the angle of emergence, i = e, and consequently r1 = r2 = r",
       "From the prism geometry relation r1+r2=A: 2r = A, so r = A/2",
       "From the deviation formula δ = i+e−A, at minimum deviation this becomes δm = 2i−A (since i=e), so i = (A+δm)/2",
       "Apply Snell's Law at the first surface: n = sin i / sin r"
     ],
     result:"n = sin[(A+δm)/2] / sin(A/2)"},
    {t:"Derivation of Magnifying Power of a Simple Microscope",
     given:"A convex lens of focal length f used as a simple magnifier, with the final virtual image formed at the near point (least distance of distinct vision, D).",
     steps:[
       "Magnifying power is defined as M = (angle subtended by the image at the eye, using the instrument) / (angle subtended by the object at the eye, at the near point without the instrument)",
       "For a thin lens with the image formed at the near point, v = −D (virtual image, same side as object, sign convention)",
       "Using the lens formula 1/v − 1/u = 1/f: −1/D − 1/u = 1/f, which gives 1/u = −1/D − 1/f",
       "Linear magnification m = v/u. Substituting u from above: m = (−D) / [−D f/(D+f)] = (D+f)/f"
     ],
     result:"M = 1 + D/f"},
    {t:"Derivation of Magnifying Power of an Astronomical Telescope",
     given:"An astronomical telescope in normal adjustment (final image at infinity): objective of focal length fo, eyepiece of focal length fe, sharing a common focal point where the objective's real image forms.",
     steps:[
       "Since the object is very far away, the objective forms a real, inverted image at its own focal point — at height h, say",
       "The angle subtended by the distant object at the objective (same as the angle subtended by this intermediate image, since the same rays are involved) is α ≈ h/fo (small angle approximation)",
       "This intermediate image lies exactly at the eyepiece's focal point too (normal adjustment), so the eyepiece views it from distance fe, and the final image (at infinity) subtends angle β ≈ h/fe at the eye",
       "Magnifying power M = β/α"
     ],
     result:"M = fo/fe"},
    {t:"Derivation of Fringe Width in Young's Double Slit Experiment",
     given:"Two coherent slits S1, S2 separated by distance d, screen at distance D (D≫d). Point P on the screen at distance x from the central point O.",
     steps:[
       "Path difference at P: Δ = S2P − S1P. Using the geometry of the setup (with D≫d and D≫x), this simplifies via the standard small-angle approximation to Δ ≈ dx/D",
       "For constructive interference (bright fringe) at P: Δ = nλ, giving the position of the nth bright fringe: xn = nλD/d",
       "The position of the next bright fringe (n+1): x(n+1) = (n+1)λD/d",
       "Fringe width β = x(n+1) − xn"
     ],
     result:"β = λD/d"}
  ]},  {cls:"12", subject:"physics", chapter:"Modern Physics", derivations:[
    {t:"Derivation of the Radioactive Decay Law",
     given:"The rate of decay of a radioactive sample is directly proportional to the number of undecayed nuclei present: dN/dt = −λN.",
     steps:[
       "Separate variables: dN/N = −λ dt",
       "Integrate the left side from N0 (at t=0) to N (at time t), and the right side from 0 to t: ∫(N0 to N) dN/N = −λ∫(0 to t) dt",
       "Evaluating: ln(N/N0) = −λt",
       "Exponentiate both sides: N = N0e^(−λt)",
       "For the half-life, set N = N0/2: ln(1/2) = −λt½, so t½ = ln2/λ = 0.693/λ"
     ],
     result:"N = N0e^(−λt); &nbsp; t½ = 0.693/λ"},
    {t:"Derivation of Bohr Radius and Energy Levels",
     given:"An electron (charge −e, mass m) orbits a nucleus of charge +Ze at radius r with speed v. Coulomb attraction supplies the centripetal force, and angular momentum is quantised.",
     steps:[
       "Coulomb force = centripetal force: (1/4πε0)(Ze²/r²) = mv²/r, which rearranges to mv² = (1/4πε0)(Ze²/r)  …(i)",
       "Bohr's quantisation postulate: mvr = nh/2π, so v = nh/2πmr  …(ii)",
       "Substitute (ii) into (i) and solve for r: r = n²h²ε0/(πmZe²) — this shows rn ∝ n²/Z; evaluating the constants gives rn = 0.529(n²/Z) Å",
       "Total energy = KE + PE = ½mv² − (1/4πε0)(Ze²/r). Using mv² from (i), KE = ½(1/4πε0)(Ze²/r)",
       "So En = ½(1/4πε0)(Ze²/r) − (1/4πε0)(Ze²/r) = −½(1/4πε0)(Ze²/r)",
       "Substituting the expression for r from above and evaluating the constants gives the standard numerical result"
     ],
     result:"rn = 0.529(n²/Z) Å &nbsp;&nbsp; En = −13.6(Z²/n²) eV"}
  ]},
]);
