  test_query = "Research that should i invest in IT-companies now?"
    test_query = input("Enter your query: ")
    print("Test Query:", test_query)
    response = get_agent_response(test_query)
    print("Response:", response)