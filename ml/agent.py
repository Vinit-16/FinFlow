from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from react_template import get_react_prompt_template
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from tools.mytools import main_tools
from jgaad_ai_agent_backup import jgaad_chat_with_gemini
# no warnings
import warnings
import sys
import os
import traceback
warnings.filterwarnings("ignore")

# Load environment variables
load_dotenv()

# Global variables
llm = None
agent_executor = None
tools = main_tools

def initialize_agent():
    """Initialize the agent and executor. Returns True if successful, False otherwise."""
    global llm, agent_executor, tools
    
    try:
        print("Initializing AI model...")
        llm = get_llm()
        print("AI model initialized successfully")
        
        print("Setting up agent prompt...")
        prompt_template = get_react_prompt_template()
        
        print("Creating agent with financial tools...")
        agent = create_react_agent(llm, tools, prompt_template)
        print("Agent created successfully")
        
        print("Initializing agent executor...")
        agent_executor = AgentExecutor(
            agent=agent, 
            tools=tools, 
            verbose=True,
            max_iterations=8,
            early_stopping_method="generate",
            handle_parsing_errors=True
        )
        print("Agent executor ready to process queries")
        return True
    except Exception as e:
        print(f"Error initializing agent: {e}")
        traceback.print_exc()
        return False

def get_llm():
    """Get LLM model with fallback options if one fails"""
    try:
        # First try Gemini as primary model
        if os.environ.get("GEMINI_API_KEY"):
            print("Using Gemini model...")
            return ChatGoogleGenerativeAI(model="gemini-1.5-flash")
    except Exception as e:
        print(f"Gemini initialization failed: {e}")
    
    try:
        # Fall back to Groq
        if os.environ.get("GROQ_API_KEY"):
            print("Using Groq model...")
            return ChatGroq(model="llama-3.3-70b-versatile")
    except Exception as e:
        print(f"Groq initialization failed: {e}")
    
    # If all fail, raise exception
    raise Exception("No LLM model could be initialized. Please set up either GEMINI_API_KEY or GROQ_API_KEY in your environment variables.")

def get_agent_response(user_input: str) -> str:
    """Process the user query using the agent and get a response."""
    global agent_executor
    
    # Initialize agent if not already initialized
    if agent_executor is None:
        success = initialize_agent()
        if not success:
            return "I'm sorry, I couldn't initialize the AI agent. Please check your API keys and try again."
    
    print(f"\nProcessing query: {user_input}")
    try:
        print("Invoking agent with tools...")
        response = agent_executor.invoke({"input": user_input})
        print("Agent completed execution successfully")
        return response["output"]
    except Exception as e:
        print(f"Agent error: {str(e)}")
        traceback.print_exc()
        # Try using the backup Gemini implementation directly
        try:
            print("Falling back to direct Gemini implementation...")
            return jgaad_chat_with_gemini(user_input, "")
        except Exception as backup_error:
            print(f"Backup error: {str(backup_error)}")
            traceback.print_exc()
            return f"I'm sorry, I'm having trouble processing your request right now. Please try again later or with a different question."

# Initialize the agent when the module is imported
if __name__ != "__main__":
    initialize_agent()

# Command line interface when run directly
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Get the query from command line arguments
        query = ' '.join(sys.argv[1:])  # Join all arguments after script name
        print("Query:", query)
        response = get_agent_response(query)
        print("<Response>", response, "</Response>")
    else:
        print("Please provide a query as command line argument")
        print("Example: python agent.py What is the stock price of RVNL?")