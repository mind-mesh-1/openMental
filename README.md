
## Prerequisites

- Python 3.12
- Node.js 18+
- PostgreSQL database API key
- Pinecone account API key
- OpenAI API key





# env variables
put a .env in your root directory 
```
NEXT_PUBLIC_COPILOT_RUNTIME_ENDPOINT=api/copilotkit
NEXT_PUBLIC_QA_URL=http://localhost:8000/api/py/source/qa
NEXT_PUBLIC_SOURCE_URL=http://localhost:8000/api/py/source
NEXT_PUBLIC_UPLOAD_ENDPOINT=http://localhost:8000/api/py/source/upload

PINECONE_API_KEY=pcskxx
DATABASE_URL=postgresqlxxx
OPENAI_API_KEY=skxxx
```


# run nextJS client side
```
pnpm install
next dev
```
default running on localhost:3000


# run fast api backend 
- server entry: api/main.py
```
python 3.12

create a venv
pip install -r requirements.txt
python -m uvicorn api.main:app --reload 
```

default running on localhost:8000
![image](https://github.com/user-attachments/assets/f95c05a1-43c8-4b0f-a969-edcb5fb7475e)
