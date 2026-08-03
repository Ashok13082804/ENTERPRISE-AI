"""
Academic Knowledge Base
Offline Curated RAG Database for Math, Bio, Physics, Chemistry, CS, and Linguistics.
"""
from typing import Dict, Any, List, Optional

ACADEMIC_DATA = {
    "biology": {
        "cell theory": {
            "explanation": "Cell Theory states that all living organisms are composed of cells, the cell is the basic structural and functional unit of life, and all cells arise from pre-existing cells.",
            "mechanism": [
                "1. All living organisms are made of one or more cells (M. J. Schleiden & Theodor Schwann, 1838-1839).",
                "2. The cell is the structural and functional unit of life.",
                "3. Omnis cellula e cellula: All cells arise from pre-existing cells (Rudolf Virchow, 1855)."
            ],
            "mnemonic": "SUM: Structure (basic), Unit (functional), Multiplication (from existing cells).",
            "references": ["NCERT Biology Class 11, Chapter 8", "Campbell Biology, 12th Ed"]
        },
        "mitosis": {
            "explanation": "Mitosis is equational cell division where a single cell divides into two identical daughter cells, maintaining the same chromosome number.",
            "mechanism": [
                "Prophase: Chromatin condenses into chromosomes, spindle fibers form, nuclear envelope breaks down.",
                "Metaphase: Chromosomes align at the equatorial plate; spindle fibers attach to kinetochores.",
                "Anaphase: Sister chromatids separate and are pulled to opposite poles by spindle fibers.",
                "Telophase: Chromosomes decondense, nuclear envelopes reform around both chromosome sets."
            ],
            "mnemonic": "PMAT: Prophase, Metaphase, Anaphase, Telophase.",
            "references": ["NCERT Biology Class 11, Chapter 10", "Raven Biology of Plants"]
        },
        "photosynthesis": {
            "explanation": "Photosynthesis is the process by which green plants convert light energy into chemical energy, synthesising glucose from carbon dioxide and water, releasing oxygen.",
            "mechanism": [
                "1. Light Reaction (in Thylakoid): Photolysis of water, ATP and NADPH synthesis.",
                "2. Dark Reaction / Calvin Cycle (in Stroma): CO2 fixation using RuBisCO, sugar production."
            ],
            "mnemonic": "LIGHT: Light absorption, Hydrogen extraction, Glucose creation, Temperature influence.",
            "references": ["NCERT Biology Class 11, Chapter 13", "Taiz & Zeiger Plant Physiology"]
        }
    },
    "physics": {
        "optical fiber": {
            "explanation": "An optical fiber is a thin, flexible, transparent fiber made of high-quality silica glass or plastic. It transmits light signals between the two ends based on the principle of Total Internal Reflection (TIR).",
            "mechanism": [
                "1. The fiber consists of a core (refractive index n1) and a surrounding cladding layer (refractive index n2), where n1 > n2.",
                "2. Light enters the core at an angle greater than the critical angle (θc = arcsin(n2/n1)).",
                "3. Due to this, the light suffers continuous total internal reflection inside the core, propagating with negligible loss."
            ],
            "mnemonic": "TIR: Total Internal Reflection requires core index (I) > cladding index (R).",
            "references": ["NCERT Physics Class 12, Chapter 9 (Optics)", "Hecht Optics, 5th Ed"]
        },
        "newton's laws": {
            "explanation": "Newton's laws of motion describe the relationship between a body and the forces acting upon it, and its motion in response to those forces.",
            "mechanism": [
                "First Law (Inertia): A body remains at rest or in uniform motion unless acted upon by an external net force.",
                "Second Law (Force): F = dp/dt = ma. Force equals mass times acceleration.",
                "Third Law (Reaction): To every action, there is an equal and opposite reaction."
            ],
            "mnemonic": "I-F-R: Inertia, Force equals ma, Reaction is opposite.",
            "references": ["NCERT Physics Class 11, Chapter 5", "Feynman Lectures on Physics, Vol 1"]
        },
        "time dilation": {
            "explanation": "Time dilation is a difference in the elapsed time measured by two clocks, either due to a relative velocity between them (special relativity) or a difference in gravitational potential between their locations (general relativity).",
            "mechanism": [
                "1. t' = t / sqrt(1 - v^2/c^2)",
                "2. As speed v approaches the speed of light c, the denominator approaches 0, meaning moving clocks run slower relative to a stationary observer."
            ],
            "mnemonic": "SLOW: Speed makes Light clocks Observe longer Seconds.",
            "references": ["NCERT Physics Class 12, Modern Physics", "Resnick & Halliday Relativity"]
        }
    },
    "chemistry": {
        "stoichiometry": {
            "explanation": "Stoichiometry is the calculation of quantitative relationships of the reactants and products in a balanced chemical reaction.",
            "mechanism": [
                "1. Write the balanced chemical equation (e.g., 2 H2 + O2 -> 2 H2O).",
                "2. Convert given mass to moles (moles = mass / molar mass).",
                "3. Use stoichiometric coefficients to find the mole ratio.",
                "4. Convert moles of target substance back to mass."
            ],
            "mnemonic": "M-R-M: Mass to Moles, Ratio of coefficients, Moles to Mass.",
            "references": ["NCERT Chemistry Class 11, Chapter 1", "Atkins Physical Chemistry"]
        },
        "nernst equation": {
            "explanation": "The Nernst equation relates the reduction potential of an electrochemical reaction to the standard electrode potential, temperature, and activities of the chemical species undergoing oxidation and reduction.",
            "mechanism": [
                "Equation: E = E° - (RT/nF) * ln(Q)",
                "At 298 K: E = E° - (0.0591/n) * log10(Q)",
                "Where n is moles of electrons, F is Faraday constant, Q is the reaction quotient."
            ],
            "mnemonic": "ENQ: Electrode potential equals standard minus constant log Reaction Quotient.",
            "references": ["NCERT Chemistry Class 12, Electrochemistry", "Bard & Faulkner Electrochemical Methods"]
        }
    },
    "computer_science": {
        "bubble sort": {
            "explanation": "Bubble Sort is a simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
            "mechanism": [
                "1. Run nested loops to compare elements at indices i and i+1.",
                "2. Swap if list[i] > list[i+1].",
                "3. Repeat n-1 times. The largest element 'bubbles' to the end in each pass.",
                "Time Complexity: Worst & Average case O(n^2), Best case O(n)."
            ],
            "code": "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr",
            "references": ["Cormen, Leiserson, Rivest, Stein (CLRS) Introduction to Algorithms"]
        },
        "quick sort": {
            "explanation": "Quick Sort is an efficient divide-and-conquer sorting algorithm that selects a 'pivot' element and partitions the array such that elements smaller than pivot go to the left and larger elements go to the right.",
            "mechanism": [
                "1. Choose a pivot element (e.g., first, last, or median).",
                "2. Partition: rearrange elements around pivot.",
                "3. Recursively apply Quick Sort to the left and right sub-arrays.",
                "Time Complexity: Average O(n log n), Worst case O(n^2) when pivot selection is poor."
            ],
            "code": "def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)",
            "references": ["CLRS Algorithms, Chapter 7"]
        }
    },
    "linguistics": {
        "grammar guide": {
            "explanation": "Linguistic grammar rules regulate word structure (morphology) and sentence layout (syntax) to produce semantically correct expressions.",
            "mechanism": [
                "Subject-Verb Agreement: The verb must agree in number and person with its subject.",
                "Tense Consistency: Maintain the same time reference (past, present, future) across connected clauses.",
                "Active vs Passive Voice: Prefer active voice for clarity and directness."
            ],
            "references": ["Chomsky Syntactic Structures", "The Elements of Style"]
        }
    }
}

def get_academic_context(subject: str, topic: str, query: str) -> Optional[Dict[str, Any]]:
    subj_key = subject.lower().strip()
    topic_key = topic.lower().strip()
    
    # Try direct subject match
    if subj_key in ACADEMIC_DATA:
        # Search inside subject topics
        for k, v in ACADEMIC_DATA[subj_key].items():
            if topic_key in k or k in topic_key or any(word in k for word in query.lower().split()):
                return v
                
    # Search all subjects for matching keys
    for sub, topics in ACADEMIC_DATA.items():
        for k, v in topics.items():
            if topic_key in k or k in topic_key or query.lower() in k or k in query.lower():
                return v
                
    return None
