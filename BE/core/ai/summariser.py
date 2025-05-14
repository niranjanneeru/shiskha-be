import os
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

from core.config import config


def create_course_summarizer():
    """
    Creates a function that summarizes course transcripts into key points.

    Returns:
        function: A function that takes a transcript and returns a summary of key points.
    """

    # Create an instance of ChatOpenAI
    llm = ChatOpenAI(
        api_key=config.OPENAI_API_KEY,
        model="gpt-4o-mini",  # You can use gpt-3.5-turbo for a cheaper but less capable option
        temperature=0.0  # Lower temperature for more consistent, focused responses
    )

    # Create a prompt template for summarization
    summary_template = """
    You are an expert course notes creator. Your task is to extract the most important points from a course transcript.

    Please analyze the following transcript and produce:
    1. A concise list of the most important key points and concepts
    2. Any critical definitions or formulas mentioned
    3. The main learning objectives or takeaways

    Make sure to focus on substantive content and disregard introductory remarks, tangents, or filler content.

    TRANSCRIPT:
    {transcript}

    KEY POINTS SUMMARY:
    """

    # Create the prompt with the template
    summary_prompt = PromptTemplate(
        input_variables=["transcript"],
        template=summary_template
    )

    # Create the chain for summarization
    summary_chain = LLMChain(llm=llm, prompt=summary_prompt)

    def summarize_transcript(transcript, max_tokens=4000):
        """
        Summarizes a course transcript into key points.

        Args:
            transcript (str): The course transcript text.
            max_tokens (int, optional): Maximum transcript length to process at once.
                                       Longer transcripts will be split and processed in chunks.

        Returns:
            str: A summary of the key points from the transcript.
        """
        # If transcript is too long, process it in chunks
        if len(transcript.split()) > max_tokens:
            # Split into chunks (this is a simple split, you might want a more sophisticated approach)
            chunks = split_into_chunks(transcript, max_tokens)

            # Process each chunk
            chunk_summaries = []
            for i, chunk in enumerate(chunks):
                print(f"Processing chunk {i + 1}/{len(chunks)}...")
                chunk_summary = summary_chain.run(transcript=chunk)
                chunk_summaries.append(chunk_summary)

            # Combine chunk summaries for a final summary
            combined_summary = "\n\n".join(chunk_summaries)

            # If combined summary is still too long, summarize it again
            if len(combined_summary.split()) > max_tokens:
                final_summary = summary_chain.run(transcript=combined_summary)
                return final_summary
            return combined_summary
        else:
            # Process the entire transcript at once
            return summary_chain.run(transcript=transcript)

    def split_into_chunks(text, max_tokens):
        """Split text into chunks of approximately max_tokens."""
        words = text.split()
        chunks = []
        current_chunk = []

        for word in words:
            current_chunk.append(word)
            if len(current_chunk) >= max_tokens:
                chunks.append(" ".join(current_chunk))
                current_chunk = []

        # Add the last chunk if there's anything left
        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    return summarize_transcript


# Example usage
if __name__ == "__main__":
    # Create the summarizer function
    summarize = create_course_summarizer()

    # Example transcript (replace with an actual transcript)
    sample_transcript = """
    Welcome to our course on Machine Learning Fundamentals. Today we'll cover supervised learning...
    Python Programming Course Transcript

Introduction:

Welcome to the Python Programming Course! In this session, we'll cover the foundational aspects of Python, which is a powerful, easy-to-learn programming language known for its readability and efficiency. By the end of this session, you'll understand Python syntax, control flow, data structures, and basic object-oriented programming.

1. Setting Up Python:

To get started, you'll need Python installed on your system. You can download it from python.org. It's recommended to use Python 3.x as Python 2.x is no longer supported.

You can verify the installation by running:

python --version

If you get a version number, you're good to go!

2. Python Basics:

Hello World:

Let's write your first Python program:

print("Hello, World!")

When you run this code, it simply outputs:

Hello, World!

Variables and Data Types:

In Python, variables are dynamically typed, meaning you don't need to explicitly declare their type:

x = 10          # Integer
y = 3.14        # Float
name = "Alice"  # String
is_active = True  # Boolean

You can use the type() function to check the type of a variable:

print(type(x))  # Output: <class 'int'>

3. Control Flow:

Python supports standard control flow operations:

If-Else Statements:

age = 18
if age >= 18:
    print("You are an adult.")
else:
    print("You are not an adult.")

Loops:

For Loop:

for i in range(5):
    print(i)

While Loop:

count = 0
while count < 5:
    print(count)
    count += 1

4. Data Structures:

Lists:

Lists are ordered and mutable collections:

fruits = ['apple', 'banana', 'cherry']
fruits.append('orange')
print(fruits)

Dictionaries:

Dictionaries are key-value pairs:

person = {'name': 'John', 'age': 30}
print(person['name'])

Sets:

Sets are unordered collections of unique elements:

unique_numbers = {1, 2, 3, 3, 4}
print(unique_numbers)  # Output: {1, 2, 3, 4}

5. Functions:

Functions in Python allow for code reusability:

def greet(name):
    return f"Hello, {name}!"

print(greet('Alice'))

You can also have default arguments:

def add(x, y=10):
    return x + y

print(add(5))  # Output: 15

6. Object-Oriented Programming:

Python supports OOP principles like inheritance, polymorphism, and encapsulation.

class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} makes a sound")

cat = Animal("Cat")
cat.speak()

Conclusion:

We covered the basics of Python, including syntax, control flow, data structures, functions, and OOP. Next, we'll dive deeper into modules, error handling, and advanced data manipulation.

Thank you for attending this session, and happy coding!
    """

    # Get the summary
    summary = summarize(sample_transcript)
    print(summary)