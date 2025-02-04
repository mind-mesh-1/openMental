## Description
Add LlamaIndex-based QA server for document retrieval and question answering.

### Changes
- Add QA server implementation using LlamaIndex TypeScript
- Add test files and test cases
- Configure OpenAI models for embeddings and question answering
- Set up environment variables for API keys

### Testing
- Single document QA tests
- Multiple document QA tests
- Error handling tests

### Dependencies
- LlamaIndex TypeScript
- OpenAI API
- Express.js for server
- Axios for testing

### Configuration
- Server runs on port 59919
- Uses OpenAI's text-embedding-ada-002 for embeddings
- Uses GPT-3.5-turbo for question answering
- CORS enabled for cross-origin requests

### Environment Variables
Required environment variables:
- `OPENAI_API_KEY`: OpenAI API key for embeddings and LLM