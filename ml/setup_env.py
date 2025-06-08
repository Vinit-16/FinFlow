#!/usr/bin/env python
"""
Setup script for configuring the environment variables for the ML components.
This will help users set up the necessary API keys for the chatbot to work.
"""
import os
import sys
from pathlib import Path
import platform
import getpass

def clear_screen():
    """Clear the terminal screen."""
    os.system('cls' if platform.system() == 'Windows' else 'clear')

def main():
    clear_screen()
    print("=" * 50)
    print(" Financial Chatbot Environment Setup ")
    print("=" * 50)
    print("\nThis script will help you set up the necessary API keys for the chatbot to work.")
    print("\nYou need at least ONE of the following API keys:")
    print("1. Gemini API Key (from Google AI Studio - https://ai.google.dev/)")
    print("2. Groq API Key (from https://console.groq.com/keys)")
    print("\nNote: Your keys will be stored in a .env file in this directory.\n")
    
    env_path = Path('.') / '.env'
    
    # Check if .env file exists and read existing values
    existing_vars = {}
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    existing_vars[key] = value
    
    # Ask for Gemini API Key
    gemini_key = existing_vars.get('GEMINI_API_KEY', '')
    masked_key = '*' * len(gemini_key) if gemini_key else '[Not set]'
    print(f"\nGemini API Key (current: {masked_key})")
    print("Get your key from: https://ai.google.dev/")
    
    change_gemini = input("Would you like to set or change the Gemini API Key? (y/n): ").lower() == 'y'
    if change_gemini:
        gemini_key = getpass.getpass("Enter your Gemini API Key: ")
    
    # Ask for Groq API Key
    groq_key = existing_vars.get('GROQ_API_KEY', '')
    masked_key = '*' * len(groq_key) if groq_key else '[Not set]'
    print(f"\nGroq API Key (current: {masked_key})")
    print("Get your key from: https://console.groq.com/keys")
    
    change_groq = input("Would you like to set or change the Groq API Key? (y/n): ").lower() == 'y'
    if change_groq:
        groq_key = getpass.getpass("Enter your Groq API Key: ")
    
    # Check if we have at least one key
    if not gemini_key and not groq_key:
        print("\n⚠️ Warning: You have not provided any API keys. The chatbot will not work without at least one.")
        proceed = input("Do you want to proceed anyway? (y/n): ").lower() == 'y'
        if not proceed:
            print("Setup aborted. Please run the script again and provide at least one API key.")
            return
    
    # Write the .env file
    with open(env_path, 'w') as f:
        f.write("# AI API Keys\n")
        
        # Write Gemini API Key
        if gemini_key:
            f.write(f"GEMINI_API_KEY={gemini_key}\n")
        else:
            f.write("# Add your Gemini API Key here (from https://ai.google.dev/)\n")
            f.write("# GEMINI_API_KEY=your_gemini_api_key_here\n")
        
        # Write Groq API Key
        if groq_key:
            f.write(f"GROQ_API_KEY={groq_key}\n")
        else:
            f.write("# Add your Groq API Key here (from https://console.groq.com/keys)\n")
            f.write("# GROQ_API_KEY=your_groq_api_key_here\n")
    
    print("\n✅ Environment setup complete!")
    print(f"The .env file has been saved to: {env_path.absolute()}")
    
    # Check if we need to remind about installing dependencies
    requirements_path = Path('.') / 'requirements.txt'
    if requirements_path.exists():
        print("\nMake sure you have installed all the required dependencies:")
        print("pip install -r requirements.txt")
    
    print("\nTo start the server, run:")
    print("python app.py")
    print("\nHappy chatting!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nSetup aborted.")
        sys.exit(1)
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        sys.exit(1) 