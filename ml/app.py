from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import re
from jgaad_ai_agent_backup import jgaad_chat_with_gemini
import gemini_fin_path
import mutual_funds_model  # Import the mutual funds model script
from stock_final_model_yug import generate_response_from_stock_info  # Import the stock analysis function
from stock_report_generator import generate_stock_report  # Import the report generation function
import os
import sys
import json
import pandas as pd
import time
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('ml_api')

app = Flask(__name__)
CORS(app)

def is_valid_ticker(ticker):
    """
    Validate if the provided ticker is a valid stock symbol.
    In a real application, this would check against a database or API.
    """
    logger.info(f"Validating ticker: {ticker}")
    # Basic validation - add more robust validation as needed
    return ticker and isinstance(ticker, str) and len(ticker) > 0

@app.route('/', methods=['GET'])
def home():
    return jsonify("HI")

# =================== DYNAMIC APIS ===================
@app.route('/agent', methods=['POST'])
def agent():
    try:
        inp = request.form.get('input')
        if not inp:
            logger.error("No input provided in request")
            return jsonify({'error': 'No input provided', 'output': 'Please provide a question or query.', 'thought': 'No input was provided to process.'}), 400
        
        logger.info(f"Agent API received input: {inp[:50]}...")
        
        # Instead of running agent.py as a subprocess, import and use directly
        try:
            logger.info("Using direct import of agent functions")
            # Import the agent module directly
            from agent import get_agent_response
            
            # Call the function directly
            final_answer = get_agent_response(inp)
            logger.info(f"Got direct response from agent (length: {len(final_answer)})")
            
            return jsonify({
                'output': final_answer, 
                'thought': "Analysis completed"
            })
            
        except Exception as agent_error:
            # Log the error
            logger.error(f"Error using direct agent: {str(agent_error)}")
            traceback.print_exc()
            
            # Fallback to direct Gemini
            try:
                logger.info("Falling back to direct Gemini call")
                final_answer = jgaad_chat_with_gemini(inp, "")
                return jsonify({'output': final_answer, 
                              'thought': f"Agent execution failed, falling back to direct Gemini call. Error: {str(agent_error)}"})
            except Exception as gemini_error:
                logger.error(f"Gemini fallback also failed: {str(gemini_error)}")
                return jsonify({'output': "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                              'thought': f"Both agent and Gemini failed. Errors: Agent: {str(agent_error)}, Gemini: {str(gemini_error)}"})
    
    except Exception as e:
        logger.error(f"Unexpected error in /agent endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Server error', 
                        'output': "I'm sorry, but something went wrong on our end. Please try again later.", 
                        'thought': f"Server error: {str(e)}"}), 500

@app.route('/analyse-stock', methods=['POST'])
def analyse_stock():
    """
    Flask endpoint to analyze a stock using the ML model.
    Accepts a ticker symbol and returns detailed analysis.
    """
    try:
        # Get the ticker from the request (support both form data and JSON)
        if request.is_json:
            data = request.get_json()
            ticker = data.get('ticker')
        else:
            ticker = request.form.get('ticker')
        
        # Validate the ticker
        if not ticker:
            return jsonify({
                "error": "Missing ticker parameter. Please provide a valid stock ticker.",
                "success": False
            }), 400
            
        # Add .NS extension if not present (for NSE stocks)
        if not ticker.endswith('.NS'):
            ticker = ticker + '.NS'
            
        time.sleep(2)
        # Generate the stock analysis
        analysis = generate_response_from_stock_info(ticker)
        
        # Return the analysis as JSON
        return jsonify({
            "success": True,
            "ticker": ticker,
            "analysis": analysis
        })
        
    except Exception as e:
        # Log the error and return a friendly message
        print(f"Error analyzing stock: {str(e)}")
        return jsonify({
            "error": f"Failed to analyze stock: {str(e)}",
            "success": False
        }), 500

@app.route('/generate-stock-report', methods=['POST'])
def generate_report():
    """
    Flask endpoint to generate a comprehensive PDF stock report with visualizations.
    Accepts a ticker symbol and returns a PDF file.
    """
    try:
        logger.info("[API Request] Report generation request received")
        if 'ticker' not in request.form:
            logger.error("[API Error] No ticker provided in form data")
            return jsonify({"error": "No ticker provided"}), 400
            
        ticker = request.form['ticker']
        logger.info(f"[API Processing] Generating report for ticker: {ticker}")
        
        # Validate ticker
        if not is_valid_ticker(ticker):
            logger.error(f"[API Error] Invalid ticker: {ticker}")
            return jsonify({"error": "Invalid ticker"}), 400
            
        # Generate report
        report_path = generate_stock_report(ticker)
        logger.info(f"[API Response] Report generated successfully for {ticker}")
        return send_file(report_path, as_attachment=True)
    except Exception as e:
        logger.error(f"[API Error] Report generation failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/ai-financial-path', methods=['POST'])
def ai_financial_path():
    try:
        logger.info("[API Request] Financial path generation request received")
        
        if 'input' not in request.form:
            logger.error("[API Error] No input provided in form data")
            return jsonify({'error': 'No input provided', 'message': 'Please provide your financial goals and preferences'}), 400
            
        input_text = request.form.get('input', '')
        risk = request.form.get('risk', 'conservative')
        
        logger.info(f"[API Processing] Generating financial path with risk profile: {risk}")
        logger.info(f"[API Processing] User input: {input_text[:50]}...")
        
        response = gemini_fin_path.get_gemini_response(input_text, risk)
        
        # Validate response has the required structure
        if not response.get('nodes') or not isinstance(response.get('nodes'), list):
            logger.error("[API Error] Invalid response structure from Gemini API")
            return jsonify({
                'error': 'Invalid response from the financial path generator',
                'message': 'Please try again with a more specific financial goal'
            }), 500
            
        logger.info("[API Response] Financial path generated successfully")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"[API Error] Financial path generation failed: {str(e)}")
        return jsonify({
            'error': 'Something went wrong', 
            'message': f'Error generating financial path: {str(e)}'
        }), 500

# =================== STATIC APIS ===================
@app.route('/auto-bank-data', methods=['get'])
def AutoBankData():
    return bank_data

@app.route('/auto-mf-data', methods=['get'])
def AutoMFData():
    return mf_data

# =================== NEW ENDPOINT ===================
@app.route('/recommend-mutual-funds', methods=['POST'])
def recommend_mutual_funds():
    """
    Flask endpoint to recommend mutual funds based on user input.
    """
    # Get the JSON data from the request
    data = request.get_json()
    
    # Extract the market cap from the JSON data
    market_cap = data.get("mutual-funds", "").strip().lower()
    
    if not market_cap:
        return jsonify({"error": "Please provide a valid market cap (e.g., 'small cap', 'mid cap', 'large cap')"}), 400
    
    # Define the path to the CSV file
    csv_file_path = "mutual_funds.csv"
    
    # Get the top mutual funds based on the market cap
    top_funds = mutual_funds_model.get_best_mutual_funds(market_cap, csv_file_path)
    
    if not top_funds:
        return jsonify({"error": "No mutual funds found for the given classification."}), 404
    
    # Return the top mutual funds as a JSON response
    return jsonify(top_funds)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        logger.info("[API Request] Prediction request received")
        data = request.json
        stock_symbol = data.get("stock_symbol")
        
        if not stock_symbol:
            logger.error("[API Error] No stock symbol provided")
            return jsonify({"error": "No stock symbol provided"}), 400
        
        logger.info(f"[API Processing] Predicting for stock symbol: {stock_symbol}")
        result = ml_model.predict(stock_symbol)
        logger.info(f"[API Response] Prediction successful for {stock_symbol}")
        return jsonify({"success": True, "data": result})
    except Exception as e:
        logger.error(f"[API Error] Prediction failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Convert JSON to CSV (if not already done)
    json_file = "data.json"  # Path to JSON file
    csv_file = "mutual_funds.csv"  # Output CSV file
    mutual_funds_model.convert_json_to_csv(json_file, csv_file)
    
    # Run the Flask app
    app.run(debug=False, port=5000)