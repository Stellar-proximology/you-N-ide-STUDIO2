"""
ERN ORACLE - YES/NO Resonance-Based Answers

Uses the ERN's Resonant Utility Engine to answer binary questions.
No LLM needed - just pure field resonance logic!

The answer depends on:
- Current field state (Body/Mind/Heart/etc.)
- Coherence level
- Element activations
- Resonance score calculation
"""

import numpy as np
from datetime import datetime
from .ern_controller import ERNController

# ============================================================================
# YES/NO ORACLE
# ============================================================================

class ERNOracle:
    """
    Simple YES/NO oracle using resonance calculations
    """
    
    def __init__(self):
        self.ern = ERNController()
        self.question_history = []
    
    def initialize(self, birth_data):
        """Initialize with birth data"""
        self.ern.initialize(birth_data)
        print("🔮 Oracle initialized and attuned to your frequency...")
    
    def ask(self, question: str) -> dict:
        """
        Ask a YES/NO question
        
        Returns:
            {
                'question': str,
                'answer': 'YES' | 'NO' | 'UNCLEAR',
                'confidence': float (0-1),
                'reasoning': str,
                'field': str,
                'coherence': float
            }
        """
        # Update oscillator state (let it breathe)
        for _ in range(50):
            self.ern.update(dt=0.01)
        
        # Get current state
        import json
        state = json.loads(self.ern.get_state_json())
        
        dominant_field = state["dominant_field"]
        coherence = state["coherence"]
        
        # Calculate resonance scores for YES and NO
        yes_score = self._calculate_yes_resonance(question, dominant_field, coherence)
        no_score = self._calculate_no_resonance(question, dominant_field, coherence)
        
        # Determine answer
        if abs(yes_score - no_score) < 0.2:
            # Too close to call
            answer = "UNCLEAR"
            confidence = 0.5 - abs(yes_score - no_score) / 2
        elif yes_score > no_score:
            answer = "YES"
            confidence = min(1.0, yes_score / (yes_score + no_score))
        else:
            answer = "NO"
            confidence = min(1.0, no_score / (yes_score + no_score))
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            answer, confidence, dominant_field, coherence, yes_score, no_score
        )
        
        # Store in history
        result = {
            "timestamp": datetime.now().isoformat(),
            "question": question,
            "answer": answer,
            "confidence": confidence,
            "reasoning": reasoning,
            "field": dominant_field,
            "coherence": coherence,
            "yes_score": yes_score,
            "no_score": no_score
        }
        
        self.question_history.append(result)
        
        return result
    
    def _calculate_yes_resonance(self, question: str, field: str, coherence: float) -> float:
        """
        Calculate resonance score for YES
        Higher score = YES is more resonant
        """
        # Base score starts at 0.5 (neutral)
        score = 0.5
        
        # Field-specific biases
        field_yes_bias = {
            "Body": 0.1,      # Body likes action (YES)
            "Mind": -0.05,    # Mind wants to analyze (cautious)
            "Heart": 0.15,    # Heart says yes to connection
            "Soul": 0.0,      # Soul is neutral
            "Spirit": 0.2,    # Spirit trusts the flow (YES)
            "Shadow": -0.3,   # Shadow is defensive (NO)
            "Light": 0.1,     # Light clarifies (slight YES)
            "Void": -0.1,     # Void prefers emptiness (slight NO)
            "Unity": 0.0      # Unity sees both
        }
        
        score += field_yes_bias.get(field, 0.0)
        
        # Coherence effect: high coherence = more confident YES
        score += coherence * 0.2
        
        # Question analysis (simple keyword detection)
        question_lower = question.lower()
        
        # Action words increase YES
        action_words = ["should", "can", "will", "start", "begin", "try", "go", "do"]
        for word in action_words:
            if word in question_lower:
                score += 0.1
                break
        
        # Question marks decrease certainty
        if "?" in question:
            score -= 0.05
        
        # Add some randomness (representing quantum uncertainty)
        score += np.random.normal(0, 0.1)
        
        # Clamp to [0, 1]
        return max(0, min(1, score))
    
    def _calculate_no_resonance(self, question: str, field: str, coherence: float) -> float:
        """
        Calculate resonance score for NO
        Higher score = NO is more resonant
        """
        # Base score starts at 0.5 (neutral)
        score = 0.5
        
        # Field-specific biases
        field_no_bias = {
            "Body": -0.1,     # Body likes action (less NO)
            "Mind": 0.15,     # Mind wants caution (MORE NO)
            "Heart": -0.15,   # Heart is open (less NO)
            "Soul": 0.0,      # Soul is neutral
            "Spirit": -0.2,   # Spirit trusts (less NO)
            "Shadow": 0.3,    # Shadow is defensive (MORE NO)
            "Light": -0.1,    # Light clarifies (less NO)
            "Void": 0.1,      # Void prefers emptiness (more NO)
            "Unity": 0.0      # Unity sees both
        }
        
        score += field_no_bias.get(field, 0.0)
        
        # Low coherence = more uncertain = more NO (caution)
        score += (1 - coherence) * 0.15
        
        # Question analysis
        question_lower = question.lower()
        
        # Caution words increase NO
        caution_words = ["risky", "dangerous", "uncertain", "worried", "afraid"]
        for word in caution_words:
            if word in question_lower:
                score += 0.15
                break
        
        # Negative phrasing increases NO
        negative_words = ["not", "don't", "shouldn't", "won't", "can't"]
        for word in negative_words:
            if word in question_lower:
                score += 0.1
                break
        
        # Add some randomness
        score += np.random.normal(0, 0.1)
        
        # Clamp to [0, 1]
        return max(0, min(1, score))
    
    def _generate_reasoning(
        self, answer: str, confidence: float, field: str, 
        coherence: float, yes_score: float, no_score: float
    ) -> str:
        """
        Generate human-readable reasoning for the answer
        """
        if answer == "UNCLEAR":
            return f"The field is torn between YES ({yes_score:.2f}) and NO ({no_score:.2f}). The {field} field at {coherence:.2f} coherence cannot decide clearly. Perhaps rephrase your question or wait for the field to shift."
        
        # Field-specific reasoning
        field_reasoning = {
            "Body": {
                "YES": f"Your body says YES. With {coherence:.2f} coherence, the physical intuition is clear. Trust the somatic knowing.",
                "NO": f"Your body says NO. At {coherence:.2f} coherence, there's a felt sense that this isn't right. Listen to the body."
            },
            "Mind": {
                "YES": f"The analytical mind says YES. At {coherence:.2f} coherence, the logic supports this path. The pattern is clear.",
                "NO": f"The mind advises NO. With {coherence:.2f} coherence, careful analysis suggests caution here. Think it through."
            },
            "Heart": {
                "YES": f"Your heart says YES. At {coherence:.2f} coherence, there's emotional resonance here. Follow what you love.",
                "NO": f"Your heart says NO. With {coherence:.2f} coherence, the emotional field doesn't align. Listen to your feelings."
            },
            "Soul": {
                "YES": f"The soul vibrates YES. At {coherence:.2f} coherence, this aligns with your deeper rhythm. Trust the pulse.",
                "NO": f"The soul says NO. At {coherence:.2f} coherence, this disrupts your natural frequency. Stay attuned."
            },
            "Spirit": {
                "YES": f"Spirit says YES. At {coherence:.2f} coherence, this serves the highest good. Trust the divine flow.",
                "NO": f"Spirit says NO. At {coherence:.2f} coherence, this doesn't serve your evolution. Release it."
            },
            "Shadow": {
                "YES": f"Even the shadow says YES, surprisingly. At {coherence:.2f} coherence, even your defenses see value here.",
                "NO": f"The shadow says NO. At {coherence:.2f} coherence, protective instincts are warning you. Stay guarded."
            },
            "Light": {
                "YES": f"The light illuminates YES. At {coherence:.2f} coherence, clarity reveals this as aligned. Proceed with awareness.",
                "NO": f"The light reveals NO. At {coherence:.2f} coherence, truth-seeing shows this isn't the way. Choose differently."
            },
            "Void": {
                "YES": f"From the void comes YES. At {coherence:.2f} coherence, emptiness paradoxically supports this. Trust the silence.",
                "NO": f"The void says NO. At {coherence:.2f} coherence, spaciousness reveals this fills no true need. Let it go."
            },
            "Unity": {
                "YES": f"Unity consciousness says YES. At {coherence:.2f} coherence, all perspectives converge on affirmation. All is one.",
                "NO": f"Unity consciousness says NO. At {coherence:.2f} coherence, the whole sees this creates separation. Return to oneness."
            }
        }
        
        base_reasoning = field_reasoning.get(field, {}).get(
            answer, 
            f"The {field} field resonates with {answer} at {coherence:.2f} coherence."
        )
        
        # Add confidence qualifier
        if confidence > 0.8:
            confidence_text = "This is a STRONG signal."
        elif confidence > 0.6:
            confidence_text = "This is a CLEAR signal."
        elif confidence > 0.4:
            confidence_text = "This is a MODERATE signal."
        else:
            confidence_text = "This is a WEAK signal - consider asking again."
        
        return f"{base_reasoning} {confidence_text} (Confidence: {confidence:.0%})"

# ============================================================================
# INTERACTIVE SESSION
# ============================================================================

def run_oracle_session():
    """
    Interactive YES/NO oracle session
    """
    print("=" * 70)
    print("🔮 ERN ORACLE - Resonance-Based YES/NO Answers 🔮")
    print("=" * 70)
    print()
    print("Ask YES/NO questions and receive answers based on the ERN's")
    print("current field state and resonance calculations.")
    print()
    print("The answer depends on which consciousness field is active")
    print("and how coherent the system is at the moment you ask.")
    print()
    print("Type 'quit' to exit.")
    print("=" * 70)
    print()
    
    # Initialize
    oracle = ERNOracle()
    
    birth_data = {
        "datetime": datetime(1990, 1, 1, 12, 0),
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timezone": "America/New_York"
    }
    
    oracle.initialize(birth_data)
    print()
    
    # Interactive loop
    while True:
        question = input("🔮 Ask your question: ")
        
        if question.lower() in ['quit', 'exit', 'q', '']:
            print("\n✨ The oracle returns to silence...")
            break
        
        # Get answer
        result = oracle.ask(question)
        
        # Display result
        print()
        print(f"   Field: {result['field']} | Coherence: {result['coherence']:.2f}")
        print()
        
        # Visual answer
        if result['answer'] == 'YES':
            print("   ✅ YES")
        elif result['answer'] == 'NO':
            print("   ❌ NO")
        else:
            print("   ⚠️  UNCLEAR")
        
        print()
        print(f"   {result['reasoning']}")
        print()
        print("-" * 70)
        print()

# ============================================================================
# DEMO MODE
# ============================================================================

def run_demo():
    """
    Demonstrate the oracle with example questions
    """
    print("=" * 70)
    print("🔮 ERN ORACLE DEMO 🔮")
    print("=" * 70)
    print()
    
    oracle = ERNOracle()
    
    birth_data = {
        "datetime": datetime(1990, 1, 1, 12, 0),
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timezone": "America/New_York"
    }
    
    oracle.initialize(birth_data)
    print()
    
    # Example questions
    questions = [
        "Should I start this new project?",
        "Is now the right time to make a change?",
        "Should I trust my intuition on this?",
        "Is this relationship aligned with my path?",
        "Should I take the risk?",
        "Will this bring me closer to my purpose?",
        "Is it time to let go?",
        "Should I wait for more clarity?"
    ]
    
    print("🎲 Asking sample questions...\n")
    
    for question in questions:
        print(f"❓ {question}")
        result = oracle.ask(question)
        
        answer_symbol = {
            "YES": "✅",
            "NO": "❌",
            "UNCLEAR": "⚠️"
        }[result['answer']]
        
        print(f"   {answer_symbol} {result['answer']} (Field: {result['field']}, Coherence: {result['coherence']:.2f})")
        print(f"   {result['reasoning']}")
        print()
    
    # Show how field shifts affect answers
    print("=" * 70)
    print("🔄 SAME QUESTION, DIFFERENT FIELD STATES")
    print("=" * 70)
    print("\nAsking the same question 5 times as the field shifts:\n")
    
    same_question = "Should I move forward with this?"
    
    for i in range(5):
        result = oracle.ask(same_question)
        
        answer_symbol = {
            "YES": "✅",
            "NO": "❌",
            "UNCLEAR": "⚠️"
        }[result['answer']]
        
        print(f"Ask #{i+1}: {answer_symbol} {result['answer']} | Field: {result['field']} | Coherence: {result['coherence']:.2f}")
    
    print()
    print("=" * 70)
    print("✨ Notice how the answer can change as fields shift!")
    print("   This reflects the dynamic nature of consciousness.")
    print("=" * 70)

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        run_oracle_session()
    else:
        run_demo()
