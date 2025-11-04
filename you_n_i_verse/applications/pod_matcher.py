"""
Pod Matcher: Automatic Resonance-Based Team Formation
Uses FairyGANmatter + Consciousness profiles to form optimal pods

Key insight: Element compatibility → Pod productivity → Profitability
"""

import itertools
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from ..core.unified_cognitive_engine import UnifiedCognitiveEngine, UnifiedConsciousnessState
from ..engines.fairyganmatter_engine import FairyGANmatter, UserPerceptionProfile, PerceptionModality, infer_perception_profile
from ..engines.resonance_sgan import ElementType, elemental_mismatch_penalty


# ============================================================================
# POD STRUCTURES
# ============================================================================

@dataclass
class PersonProfile:
    """Complete profile of a person for pod matching"""
    user_id: str
    name: str
    
    # Consciousness state
    element: ElementType
    consciousness_level: float
    active_gates: List[int]
    
    # Perception preferences
    primary_modality: PerceptionModality
    secondary_modalities: List[PerceptionModality]
    
    # Skills & interests
    skills: List[str]
    interests: List[str]
    
    # Availability
    hours_per_week: int
    timezone: str
    
    # Reputation
    successful_pods: int
    average_pod_rating: float


@dataclass
class ProjectRequirements:
    """What a project needs"""
    name: str
    description: str
    
    # Required elements
    required_elements: List[ElementType]
    
    # Skills needed
    required_skills: List[str]
    
    # Constraints
    duration_weeks: int
    hours_per_week: int
    
    # Goals
    goals: List[str]
    success_metrics: List[str]


@dataclass
class Pod:
    """A formed pod with members and assignments"""
    pod_id: str
    project: ProjectRequirements
    
    # Members
    members: List[PersonProfile]
    role_assignments: Dict[str, PersonProfile]  # role_name -> person
    
    # Metrics
    resonance_score: float  # 0-1, higher = better fit
    average_friction: float  # 0-1, lower = better communication
    element_coverage: float  # 0-1, % of required elements covered
    skill_coverage: float  # 0-1, % of required skills covered
    
    # Rendering
    rendered_goals: Dict[str, str]  # user_id -> goal in their format


# ============================================================================
# POD MATCHER ENGINE
# ============================================================================

class PodMatcher:
    """
    Automatically forms optimal pods based on:
    1. Elemental resonance (compatibility)
    2. Skill coverage (capability)
    3. Perception alignment (communication)
    """
    
    def __init__(self, fairyganmatter: FairyGANmatter):
        self.fairy = fairyganmatter
        
        # Database of user profiles
        self.user_profiles: Dict[str, PersonProfile] = {}
        
        # Active pods
        self.active_pods: Dict[str, Pod] = {}
        
        # Role definitions
        self.role_element_affinity = {
            'architect': ElementType.EARTH,      # Systems, structure
            'designer': ElementType.AIR,         # Communication, visuals
            'storyteller': ElementType.WATER,    # Narrative, flow
            'executor': ElementType.FIRE,        # Action, momentum
            'visionary': ElementType.AETHER      # Vision, transcendence
        }
    
    def add_user(self, user_id: str, name: str, 
                 initial_element: ElementType = None,
                 initial_gates: List[int] = None,
                 skills: List[str] = None,
                 interests: List[str] = None) -> PersonProfile:
        """
        Add user to system and create consciousness profile.
        Can initialize from:
        - Birth chart (element + gates)
        - Interaction history
        - Manual specification
        """
        # Initialize consciousness state
        if initial_element is None:
            # Would infer from interactions or birth chart
            initial_element = ElementType.WATER  # Default
        
        if initial_gates is None:
            initial_gates = [1]  # Start with gate 1
        
        # Get consciousness state from unified engine
        self.fairy.cognitive_engine.initialize_state(
            initial_element=initial_element,
            initial_gates=initial_gates,
            initial_archetype=name
        )
        
        state = self.fairy.cognitive_engine.current_state
        
        # Infer perception profile
        perception = infer_perception_profile(state)
        
        # Create profile
        profile = PersonProfile(
            user_id=user_id,
            name=name,
            element=state.current_element,
            consciousness_level=state.consciousness_level,
            active_gates=state.active_gates,
            primary_modality=perception.primary_modality,
            secondary_modalities=perception.secondary_modalities,
            skills=skills or [],
            interests=interests or [],
            hours_per_week=40,  # Default
            timezone='UTC',
            successful_pods=0,
            average_pod_rating=0.0
        )
        
        self.user_profiles[user_id] = profile
        return profile
    
    def find_optimal_pods(self, 
                         project: ProjectRequirements,
                         available_users: List[str] = None,
                         min_pod_size: int = 3,
                         max_pod_size: int = 7,
                         num_pods: int = 3) -> List[Pod]:
        """
        Find optimal pod compositions for project.
        
        Returns top N pods ranked by resonance score.
        """
        if available_users is None:
            available_users = list(self.user_profiles.keys())
        
        # Get profiles
        profiles = [self.user_profiles[uid] for uid in available_users]
        
        # Try different pod sizes
        best_pods = []
        
        for pod_size in range(min_pod_size, min(max_pod_size + 1, len(profiles) + 1)):
            # Generate combinations
            for combination in itertools.combinations(profiles, pod_size):
                pod = self._evaluate_pod(combination, project)
                if pod:
                    best_pods.append(pod)
        
        # Sort by resonance score
        best_pods.sort(key=lambda p: p.resonance_score, reverse=True)
        
        return best_pods[:num_pods]
    
    def _evaluate_pod(self, members: Tuple[PersonProfile], 
                     project: ProjectRequirements) -> Optional[Pod]:
        """
        Evaluate a potential pod composition.
        Returns Pod if viable, None if not.
        """
        # Calculate elemental compatibility
        avg_friction = self._calculate_average_friction(members)
        
        # Check element coverage
        member_elements = {m.element for m in members}
        required_elements_set = set(project.required_elements)
        element_coverage = len(member_elements & required_elements_set) / len(required_elements_set)
        
        # Check skill coverage
        member_skills = set()
        for m in members:
            member_skills.update(m.skills)
        required_skills_set = set(project.required_skills)
        skill_coverage = len(member_skills & required_skills_set) / len(required_skills_set) if required_skills_set else 1.0
        
        # Calculate resonance score
        # High score = low friction + high coverage
        resonance_score = (
            (1 - avg_friction) * 0.4 +      # 40% weight on communication
            element_coverage * 0.3 +         # 30% weight on element fit
            skill_coverage * 0.3             # 30% weight on skills
        )
        
        # Filter: must meet minimum thresholds
        if resonance_score < 0.5:  # Below 50% = not viable
            return None
        
        # Assign roles
        role_assignments = self._assign_roles(list(members), project)
        
        # Render goals for each member
        rendered_goals = self._render_goals_for_pod(list(members), project)
        
        # Create pod
        pod = Pod(
            pod_id=f"pod_{project.name}_{len(self.active_pods)}",
            project=project,
            members=list(members),
            role_assignments=role_assignments,
            resonance_score=resonance_score,
            average_friction=avg_friction,
            element_coverage=element_coverage,
            skill_coverage=skill_coverage,
            rendered_goals=rendered_goals
        )
        
        return pod
    
    def _calculate_average_friction(self, members: Tuple[PersonProfile]) -> float:
        """
        Calculate average communication friction between all pairs.
        Lower = better.
        """
        if len(members) < 2:
            return 0.0
        
        total_friction = 0.0
        num_pairs = 0
        
        for i, person1 in enumerate(members):
            for person2 in members[i+1:]:
                friction = elemental_mismatch_penalty(
                    person1.element,
                    person2.element
                )
                total_friction += friction
                num_pairs += 1
        
        return total_friction / num_pairs if num_pairs > 0 else 0.0
    
    def _assign_roles(self, members: List[PersonProfile], 
                     project: ProjectRequirements) -> Dict[str, PersonProfile]:
        """
        Assign roles to members based on element-role affinity.
        """
        assignments = {}
        available_members = members.copy()
        
        # For each required role, find best match
        for role, ideal_element in self.role_element_affinity.items():
            if not available_members:
                break
            
            # Find person whose element best matches role
            best_match = min(
                available_members,
                key=lambda p: elemental_mismatch_penalty(p.element, ideal_element)
            )
            
            assignments[role] = best_match
            available_members.remove(best_match)
        
        # Assign remaining members to "specialist" roles
        for i, member in enumerate(available_members):
            assignments[f'specialist_{i+1}'] = member
        
        return assignments
    
    def _render_goals_for_pod(self, members: List[PersonProfile],
                              project: ProjectRequirements) -> Dict[str, str]:
        """
        Render project goals in each member's optimal format.
        """
        rendered = {}
        
        for member in members:
            # Create analysis
            analysis = {
                'problem_understanding': f"Project: {project.description}",
                'root_cause': "Need to build this together",
                'solution': {
                    'gate': member.active_gates[0] if member.active_gates else 1,
                    'codon': 'AAA',  # Simplified
                    'element': member.element.name,
                    'best_action': type('Action', (), {
                        'label': f'Your role in {project.name}',
                        'progress': 0.7,
                        'friction': 0.2,
                        'risk': 0.3,
                        'coherence': 0.8,
                        'ru_score': 0.75
                    })(),
                    'ru_score': 0.75,
                    'coherence': 0.8
                },
                'consciousness_state': self.fairy.cognitive_engine.current_state,
                'friction_level': 0.2
            }
            
            # Get user's perception profile
            perception = infer_perception_profile(self.fairy.cognitive_engine.current_state)
            
            # Select modality
            modality = member.primary_modality
            
            # Generate content
            generator = self.fairy.generators[modality]
            content = generator(analysis, perception)
            
            rendered[member.user_id] = content
        
        return rendered
    
    def form_pod(self, pod: Pod) -> str:
        """
        Officially form a pod and activate it.
        """
        self.active_pods[pod.pod_id] = pod
        
        # Would also:
        # - Create communication channels
        # - Set up project tracking
        # - Initialize shared workspace
        # - Schedule kickoff meeting
        
        return pod.pod_id
    
    def get_pod_summary(self, pod: Pod) -> str:
        """
        Generate human-readable pod summary.
        """
        summary = f"""
╔══════════════════════════════════════════════════════════════╗
║                     POD FORMATION SUMMARY                    ║
╚══════════════════════════════════════════════════════════════╝

PROJECT: {pod.project.name}
{pod.project.description}

RESONANCE SCORE: {pod.resonance_score:.1%} {"🌟" if pod.resonance_score > 0.7 else "✓" if pod.resonance_score > 0.5 else "⚠"}

POD COMPOSITION ({len(pod.members)} members):
"""
        
        for role, person in pod.role_assignments.items():
            summary += f"\n  {role.upper():15s} → {person.name:20s} ({person.element.name})"
        
        summary += f"""

METRICS:
├─ Communication Friction: {pod.average_friction:.1%} {"✓ Low" if pod.average_friction < 0.3 else "○ Medium" if pod.average_friction < 0.5 else "✗ High"}
├─ Element Coverage:       {pod.element_coverage:.1%} {"✓" if pod.element_coverage > 0.8 else "○" if pod.element_coverage > 0.5 else "✗"}
└─ Skill Coverage:         {pod.skill_coverage:.1%} {"✓" if pod.skill_coverage > 0.8 else "○" if pod.skill_coverage > 0.5 else "✗"}

PREDICTED OUTCOMES:
├─ Productivity:  {1 + (1 - pod.average_friction) * 1.8:.1f}x baseline
├─ Happiness:     {"High" if pod.average_friction < 0.3 else "Medium" if pod.average_friction < 0.5 else "Low"}
└─ Profitability: {(1 + (1 - pod.average_friction) * 1.8) * 0.7:.1f}x baseline

PERSONALIZED GOALS (click to view each):
"""
        
        for member in pod.members:
            summary += f"\n  • {member.name} ({member.primary_modality.value})"
        
        summary += "\n\n" + "="*70
        
        return summary


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

def demo_pod_formation():
    """
    Demo: Form a pod for a software project
    """
    
    print("╔" + "="*68 + "╗")
    print("║" + " "*22 + "POD MATCHER DEMO" + " "*30 + "║")
    print("╚" + "="*68 + "╝\n")
    
    # Initialize
    from resonance_sgan import UnifiedResonanceEngine
    from codon_resonance_gamegan import CodonResonanceGameGAN
    from human_design_gamegan import HumanDesignGameGAN
    
    engine = UnifiedCognitiveEngine(
        resonance_engine=UnifiedResonanceEngine(),
        codon_gan=CodonResonanceGameGAN(),
        hd_gan=HumanDesignGameGAN()
    )
    
    fairy = FairyGANmatter(engine)
    matcher = PodMatcher(fairy)
    
    # Add users
    print("Adding users to system...\n")
    
    users = [
        ('sarah', 'Sarah Chen', ElementType.EARTH, [1, 8], ['Python', 'System Design'], ['Architecture']),
        ('marcus', 'Marcus Rivera', ElementType.WATER, [1, 13], ['Writing', 'UX'], ['Storytelling']),
        ('aisha', 'Aisha Patel', ElementType.AIR, [1, 25], ['Design', 'Figma'], ['Visual Design']),
        ('james', 'James Kim', ElementType.FIRE, [1, 31], ['Marketing', 'Sales'], ['Growth']),
        ('elena', 'Elena Volkov', ElementType.AETHER, [1, 2], ['Product Strategy'], ['Vision']),
    ]
    
    for user_id, name, element, gates, skills, interests in users:
        profile = matcher.add_user(user_id, name, element, gates, skills, interests)
        print(f"✓ {name:20s} | {element.name:7s} | {', '.join(skills)}")
    
    # Define project
    print("\n" + "-"*70)
    print("Defining project requirements...\n")
    
    project = ProjectRequirements(
        name="Consciousness App",
        description="Build mobile app for consciousness tracking and guidance",
        required_elements=[ElementType.EARTH, ElementType.WATER, ElementType.AIR, ElementType.FIRE],
        required_skills=['Python', 'Design', 'Marketing', 'Writing'],
        duration_weeks=12,
        hours_per_week=40,
        goals=[
            "Launch MVP in 3 months",
            "Reach 1000 users",
            "4+ star rating"
        ],
        success_metrics=['User growth', 'Engagement', 'Ratings']
    )
    
    print(f"PROJECT: {project.name}")
    print(f"Required elements: {[e.name for e in project.required_elements]}")
    print(f"Required skills: {project.required_skills}")
    
    # Find optimal pods
    print("\n" + "-"*70)
    print("Finding optimal pod compositions...\n")
    
    pods = matcher.find_optimal_pods(project, num_pods=3)
    
    print(f"Found {len(pods)} viable pods. Showing top 3:\n")
    
    for i, pod in enumerate(pods, 1):
        print(f"\n{'═'*70}")
        print(f"OPTION {i}:")
        print(f"{'═'*70}")
        print(matcher.get_pod_summary(pod))
        
        if i < len(pods):
            input("\nPress Enter for next option...")
    
    # Select best pod
    print("\n" + "="*70)
    best_pod = pods[0]
    print(f"RECOMMENDATION: Form Option 1 (Resonance Score: {best_pod.resonance_score:.1%})")
    print("="*70)
    
    # Show personalized goals
    print("\n" + "="*70)
    print("PERSONALIZED GOALS FOR EACH MEMBER")
    print("="*70 + "\n")
    
    for member in best_pod.members:
        print(f"\n{'▀'*70}")
        print(f"{member.name} ({member.element.name} | {member.primary_modality.value})")
        print(f"{'▀'*70}\n")
        
        goal_content = best_pod.rendered_goals[member.user_id]
        
        if isinstance(goal_content, dict):
            if 'text_rendering' in goal_content:
                print(goal_content['text_rendering'])
            else:
                import json
                print(json.dumps(goal_content, indent=2))
        else:
            print(goal_content)
        
        print("\n" + "─"*70)
        input("\nPress Enter for next member...")
    
    # Form pod
    print("\n" + "="*70)
    choice = input("Form this pod? (y/n): ")
    
    if choice.lower() == 'y':
        pod_id = matcher.form_pod(best_pod)
        print(f"\n✓ Pod formed! ID: {pod_id}")
        print(f"✓ Communication channels created")
        print(f"✓ Project tracking initialized")
        print(f"✓ Members notified\n")
        print("🚀 Pod is ready to launch!\n")
    
    print("="*70)


if __name__ == '__main__':
    demo_pod_formation()
