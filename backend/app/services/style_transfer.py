"""
Style Transfer Service
Transforms T5 empathetic output into different personas/styles.
"""

import re
import random
from typing import Literal

# Supported styles
StyleType = Literal["Diplomat", "Gen Z", "Executive", "Victorian"]


def apply_style(text: str, style: str = "Diplomat") -> str:
    """
    Apply persona/style transformation to text.
    
    Args:
        text: The base empathetic text (from T5 model)
        style: One of "Diplomat", "Gen Z", "Executive", "Victorian"
    
    Returns:
        Transformed text in the specified style
    """
    style = style.strip().title()  # Normalize: "gen z" -> "Gen Z"
    
    if style == "Diplomat" or not text:
        return text
    elif style == "Gen Z":
        return _apply_gen_z_style(text)
    elif style == "Executive":
        return _apply_executive_style(text)
    elif style == "Victorian":
        return _apply_victorian_style(text)
    else:
        # Unknown style, return original
        return text


def _apply_gen_z_style(text: str) -> str:
    """
    Gen Z style: lowercase, no punctuation, casual slang.
    Example: "I understand your frustration." -> "i understand your frustration ngl"
    """
    # Convert to lowercase
    result = text.lower()
    
    # Remove formal punctuation (keep apostrophes)
    result = re.sub(r'[.,!?;:]', '', result)
    
    # Replace formal phrases with casual ones
    replacements = [
        (r'\bi am\b', "im"),
        (r'\byou are\b', "ur"),
        (r'\bdo not\b', "dont"),
        (r'\bcannot\b', "cant"),
        (r'\bwill not\b', "wont"),
        (r'\bvery\b', "super"),
        (r'\breally\b', "lowkey"),
        (r'\bunderstand\b', "get"),
        (r'\bdifficult\b', "rough"),
        (r'\bsituation\b', "sitch"),
        (r'\bproblem\b', "issue"),
        (r'\bplease\b', "pls"),
        (r'\bthank you\b', "ty"),
        (r'\bthanks\b', "thx"),
    ]
    
    for pattern, replacement in replacements:
        result = re.sub(pattern, replacement, result)
    
    # Clean up extra spaces
    result = re.sub(r'\s+', ' ', result).strip()
    
    # Randomly append Gen Z phrases
    endings = ["tbh", "ngl", "fr fr", "no cap", "lowkey", "its giving", "slay"]
    if random.random() > 0.3:  # 70% chance to add ending
        result = f"{result} {random.choice(endings)}"
    
    return result


def _apply_executive_style(text: str) -> str:
    """
    Executive style: concise, punchy, professional. No fluff.
    Example: "I really understand that this is very frustrating." -> "I understand. This is frustrating."
    """
    # Remove filler words and phrases
    filler_patterns = [
        r'\breally\s+',
        r'\bvery\s+',
        r'\bjust\s+',
        r'\bactually\s+',
        r'\bbasically\s+',
        r'\bhonestly\s+',
        r'\bliterally\s+',
        r'\bkind of\s+',
        r'\bsort of\s+',
        r'\ba bit\s+',
        r'\ba little\s+',
        r'\bI think that\s+',
        r'\bI believe that\s+',
        r'\bI feel like\s+',
        r'\bin my opinion\s*,?\s*',
        r'\bto be honest\s*,?\s*',
        r'\bif I may\s*,?\s*',
        r'\bperhaps\s+',
        r'\bmaybe\s+',
    ]
    
    result = text
    for pattern in filler_patterns:
        result = re.sub(pattern, '', result, flags=re.IGNORECASE)
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', result)
    processed_sentences = []
    
    for sentence in sentences:
        words = sentence.split()
        
        # Keep sentences under 12 words
        if len(words) > 12:
            # Take first 10-12 words, end at logical break
            truncated = words[:12]
            sentence = ' '.join(truncated)
            
            # Clean up ending
            sentence = re.sub(r'\s+(and|but|or|so|because)$', '', sentence, flags=re.IGNORECASE)
            
            # Ensure proper ending
            if not sentence.endswith(('.', '!', '?')):
                sentence += '.'
        
        if sentence.strip():
            processed_sentences.append(sentence.strip())
    
    result = ' '.join(processed_sentences)
    
    # Clean up spacing and capitalization
    result = re.sub(r'\s+', ' ', result).strip()
    
    # Ensure first letter is capitalized
    if result:
        result = result[0].upper() + result[1:]
    
    return result


def _apply_victorian_style(text: str) -> str:
    """
    Victorian style: extremely formal, flowery language.
    Example: "I understand" -> "It is my humble understanding"
    """
    result = text
    
    # Victorian word/phrase replacements (order matters - longer phrases first)
    replacements = [
        # Phrases
        (r'\bI think\b', "It is my humble opinion that"),
        (r'\bI understand\b', "I do most earnestly comprehend"),
        (r'\bI feel\b', "I find myself experiencing"),
        (r'\bI believe\b', "It is my sincere belief that"),
        (r'\bI hope\b', "I do fervently wish"),
        (r'\bI am sorry\b', "I find myself most regretful"),
        (r'\bI\'m sorry\b', "I find myself most regretful"),
        (r'\bthank you\b', "I extend my most gracious appreciation"),
        (r'\bthanks\b', "my gratitude to you"),
        (r'\bplease\b', "I humbly beseech you to"),
        (r'\bcan we\b', "might we perchance"),
        (r'\bcan I\b', "might I humbly"),
        (r'\blet me\b', "pray, allow me to"),
        (r'\bI want\b', "I do earnestly desire"),
        (r'\bI need\b', "I find myself in want of"),
        
        # Words
        (r'\bbad\b', "most unfavorable"),
        (r'\bgood\b', "most agreeable"),
        (r'\bhappy\b', "filled with great felicity"),
        (r'\bsad\b', "overcome with melancholy"),
        (r'\bangry\b', "vexed beyond measure"),
        (r'\bvery\b', "exceedingly"),
        (r'\breally\b', "most assuredly"),
        (r'\byes\b', "indeed"),
        (r'\bno\b', "I must regretfully decline"),
        (r'\bokay\b', "most agreeable"),
        (r'\bok\b', "most agreeable"),
        (r'\bhelp\b', "render assistance"),
        (r'\bproblem\b', "matter of concern"),
        (r'\bissue\b', "matter requiring attention"),
        (r'\bsituation\b', "present circumstances"),
        (r'\bdifficult\b', "most challenging"),
        (r'\beasy\b', "most effortless"),
        (r'\bfast\b', "with great haste"),
        (r'\bslow\b', "with deliberate care"),
        (r'\bnow\b', "at this present moment"),
        (r'\bsoon\b', "in due course"),
        (r'\blater\b', "at a subsequent time"),
        (r'\btoday\b', "on this very day"),
        (r'\btomorrow\b', "on the morrow"),
        (r'\byesterday\b', "on the day prior"),
    ]
    
    for pattern, replacement in replacements:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Add Victorian flourishes at the end
    endings = [
        ", if you would be so kind.",
        ", I remain your humble servant.",
        ", with utmost sincerity.",
        ", herewith.",
        "."
    ]
    
    # Remove existing ending punctuation and add Victorian ending
    result = result.rstrip('.!?')
    result += random.choice(endings)
    
    # Ensure proper capitalization
    if result:
        result = result[0].upper() + result[1:]
    
    return result


# Helper function to get available styles
def get_available_styles() -> list[str]:
    """Return list of available style options."""
    return ["Diplomat", "Gen Z", "Executive", "Victorian"]
