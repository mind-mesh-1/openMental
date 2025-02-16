from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api', methods=['POST'])
def handle_request():
    action_handlers = {
    'analyzeSources': lambda source_ids, question: analyze_sources(source_ids, question),
    'summarizeSource': lambda source_id: summarize_source(source_id)
}

    data = request.json
    action = data.get('action')
    params = data.get('params', {})

    if action in action_handlers:
        result = action_handlers[action](**params)
        return jsonify(result)
    else:
        return jsonify({'error': 'Unknown action'}), 400

def analyze_sources(source_ids, question):
    # Placeholder for analyzeSources logic
    return {'message': 'analyzeSources executed'}

def summarize_source(source_id):
    # Placeholder for summarizeSource logic
    return {'message': 'summarizeSource executed'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=53202)