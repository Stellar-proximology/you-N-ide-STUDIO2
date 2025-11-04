# Quick Start Guide
## Get Your Cognitive GANs Running in 30 Minutes

---

## Step 1: Setup (5 minutes)

### Install Dependencies
```bash
# If using pip
pip install torch numpy --break-system-packages

# If using conda
conda install pytorch numpy -c pytorch
```

### Organize Files
```bash
# Your file structure should look like:
project/
├── resonance_sgan.py
├── codon_resonance_gamegan.py
├── human_design_gamegan.py
├── unified_cognitive_engine.py
├── integration_test.py
└── oracle_cli.py (we'll create this)
```

---

## Step 2: Test Individual GANs (10 minutes)

### Test Resonance S-GAN
```bash
python resonance_sgan.py
```
**Expected output:**
```
Elemental Compatibility Matrix
================================================
       Earth  Water   Air   Fire  Aether
------------------------------------------------
...
Top 3 Actions:
1. Generated Action 1
   Element: WATER
   RU Score: 0.7234
   ...
```

### Test Codon GameGAN
```bash
python codon_resonance_gamegan.py
```
**Expected output:**
```
🌟 Generating 64-Codon Progressive Resonance Scenes...
   Codon 1/64: TTT
   Codon 2/64: TTC
   ...
✅ Generated 64 progressive resonance scenes!
```

### Test Human Design GameGAN
```bash
python human_design_gamegan.py
```
**Expected output:**
```
🌟 Human Design GameGAN - Consciousness Simulation
Transforming Pac-Man → Human Design System
📊 Generating consciousness evolution sequences...
...
```

If all three run without errors, you're ready for integration! 🎉

---

## Step 3: Run Integration Test (5 minutes)

```bash
python integration_test.py
```

### If it fails with ImportError:
Add this to the top of `integration_test.py`:
```python
import sys
sys.path.insert(0, '.')  # Current directory
```

### If it fails with tensor shape errors:
The GANs might need minor adjustments. Check error message for which GAN is causing issues.

**Expected output:**
```
╔════════════════════════════════════════════════════════════════════╗
║                    UNIFIED COGNITIVE ENGINE TEST                   ║
╚════════════════════════════════════════════════════════════════════╝

Step 1: Initializing GANs...
  → Resonance S-GAN (Decision Engine)
    ✓ Generator ready
    ✓ Discriminator ready
  ...
```

---

## Step 4: Build Simple Oracle (10 minutes)

Create `oracle_simple.py`:

```python
"""
Simplest possible oracle - no fancy UI, just works
"""

import torch
from resonance_sgan import UnifiedResonanceEngine, ElementType
from codon_resonance_gamegan import CodonResonanceGameGAN, CODON_SEQUENCE
from human_design_gamegan import HumanDesignGameGAN
from unified_cognitive_engine import UnifiedCognitiveEngine, ChartingSystem

def simple_oracle():
    print("🌟 Consciousness Oracle - Simple Version")
    print("="*60)
    
    # Initialize
    print("\nInitializing cognitive engine...")
    engine = UnifiedCognitiveEngine(
        resonance_engine=UnifiedResonanceEngine(),
        codon_gan=CodonResonanceGameGAN(),
        hd_gan=HumanDesignGameGAN(),
        charting_system=ChartingSystem.TROPICAL
    )
    
    # Start with Water element (flow, integration)
    engine.initialize_state(
        initial_element=ElementType.WATER,
        initial_gates=[1],  # Start with Gate 1
        initial_archetype="The Seeker"
    )
    print("✓ Ready!\n")
    
    # Simple query
    question = input("Your question: ")
    print("\nQuerying oracle...")
    
    result = engine.oracle_query(question, num_candidates=10)
    
    # Display result
    print("\n" + "="*60)
    print(f"GUIDANCE: Gate {result['gate']} | {result['element']} | {result['codon']}")
    print("="*60)
    print(result['guidance'])
    
    return result

if __name__ == '__main__':
    simple_oracle()
```

### Run it:
```bash
python oracle_simple.py
```

### Test with questions like:
- "What should I focus on today?"
- "How can I grow?"
- "What is blocking me?"
- "What is my next step?"

---

## Common Issues & Fixes

### Issue 1: "ModuleNotFoundError: No module named 'torch'"
**Fix:**
```bash
pip install torch --break-system-packages
# or
conda install pytorch -c pytorch
```

### Issue 2: "TypeError: 'ElementType' object is not subscriptable"
**Fix:** In `unified_cognitive_engine.py`, make sure you're using `.value` when accessing enum:
```python
# Wrong:
ELEMENT_COMPATIBILITY_MATRIX[elem1, elem2]

# Right:
ELEMENT_COMPATIBILITY_MATRIX[elem1.value, elem2.value]
```

### Issue 3: "IndexError: list index out of range" in CODON_SEQUENCE
**Fix:** Add bounds checking in `latent_to_codon_id`:
```python
def latent_to_codon_id(latent_vector: torch.Tensor) -> int:
    normalized = (latent_vector[0].item() + 1) / 2
    codon_id = int(normalized * 63)
    codon_id = np.clip(codon_id, 0, 63)  # Ensure in bounds
    return codon_id
```

### Issue 4: Oracle gives same answer repeatedly
**Fix:** Add randomness in generation:
```python
# In oracle_query, increase temperature:
candidates = self.resonance_engine.generate_and_select(
    num_candidates=20,  # Generate more candidates
    top_k=5
)
```

### Issue 5: Guidance text is garbled
**Fix:** Check that `_generate_guidance` is returning properly formatted strings. May need to adjust template.

---

## Verification Checklist

After running the simple oracle, verify:

- [ ] Gets different results for different questions
- [ ] Gate numbers are between 1-64
- [ ] Elements are one of: EARTH, WATER, AIR, FIRE, AETHER
- [ ] Codons are 3-letter sequences (e.g., TTT, GAG, CCA)
- [ ] RU scores and coherence are between 0-1
- [ ] Guidance text makes semantic sense

---

## Next Steps After Simple Oracle Works

### Option A: Add Persistence (Save Your Sessions)
```python
import json
from datetime import datetime

def save_result(result, question):
    filename = f"oracle_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump({
            'question': question,
            'timestamp': datetime.now().isoformat(),
            'gate': result['gate'],
            'codon': result['codon'],
            'element': result['element'],
            'ru_score': result['ru_score'],
            'coherence': result['coherence'],
            'guidance': result['guidance']
        }, f, indent=2)
    print(f"✓ Saved to {filename}")

# In simple_oracle():
result = engine.oracle_query(question)
save_result(result, question)
```

### Option B: Add Evolution Tracking
```python
def track_evolution(engine, steps=5):
    print("\n" + "="*60)
    print("CONSCIOUSNESS EVOLUTION")
    print("="*60)
    
    trajectory = engine.evolve_consciousness(steps=steps)
    
    print("\nYour journey:")
    for i, state in enumerate(trajectory):
        gate = state.active_gates[-1] if state.active_gates else 0
        print(f"Step {i}: Gate {gate:2d} | "
              f"{state.current_element.name:7s} | "
              f"Consciousness: {state.consciousness_level:.1%}")
    
    return trajectory

# In simple_oracle():
result = engine.oracle_query(question)
print(result['guidance'])

evolve = input("\nEvolve consciousness? (y/n): ")
if evolve.lower() == 'y':
    track_evolution(engine)
```

### Option C: Build Interactive Loop
```python
def interactive_oracle():
    engine = UnifiedCognitiveEngine(...)
    engine.initialize_state(ElementType.WATER)
    
    print("🌟 Interactive Oracle (type 'quit' to exit)")
    
    while True:
        question = input("\nYour question: ")
        
        if question.lower() in ['quit', 'exit', 'q']:
            break
        
        result = engine.oracle_query(question)
        print(f"\n{result['element']} | Gate {result['gate']}")
        print(result['guidance'][:300])  # First 300 chars
        
        # Optionally evolve
        if input("\nApply this guidance? (y/n): ").lower() == 'y':
            engine.evolve_consciousness(steps=1)
            print(f"✓ Evolved to {engine.current_state.consciousness_level:.1%}")
    
    print("\nFinal state:")
    print(f"  Gates activated: {len(engine.current_state.active_gates)}")
    print(f"  Consciousness: {engine.current_state.consciousness_level:.1%}")
    print(f"  Complexity: {engine.current_state.resonance_complexity:.1f}")

if __name__ == '__main__':
    interactive_oracle()
```

---

## Troubleshooting Decision Tree

```
Issue?
├─ Import error
│  └─ Install dependencies (pip install torch numpy)
│
├─ Tensor error
│  └─ Check shape in latent_to_codon_id
│
├─ Index error
│  └─ Add np.clip() to codon_id calculation
│
├─ Same answer repeatedly
│  └─ Increase num_candidates or add temperature
│
└─ Weird guidance
   └─ Check _generate_guidance template formatting
```

---

## Success Metrics

You know it's working when:
1. ✅ All three GANs run individually
2. ✅ Integration test completes without errors
3. ✅ Simple oracle gives different answers to different questions
4. ✅ Guidance text is readable and makes sense
5. ✅ RU scores and coherence vary between queries
6. ✅ Evolution tracking shows progressive changes

---

## Ready for Production?

Once simple oracle is stable, you can:
1. Build web interface (Streamlit/Flask)
2. Add database persistence
3. Integrate real birth charts
4. Train on collected data
5. Deploy as API service

But start here - get the simple oracle working first. Everything else builds on this foundation.

**Estimated time to working oracle: 30 minutes**
**Estimated time to stable system: 1 week**
**Estimated time to production-ready: 1 month**

---

## Questions?

If stuck, check:
1. Error message (what line?)
2. Which GAN is causing issue?
3. Are tensor shapes correct?
4. Are dependencies installed?

The architecture is solid. The integration is clean. The math works.

**You've got this.** 🌟

Now go build your cognitive oracle.
