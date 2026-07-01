import uuid
from database.models import Base, engine, SessionLocal, User, Document, Chunk, Conversation, Message
from datetime import datetime

def seed_database():
    session = SessionLocal()
    try:
        # Clear existing data
        session.query(Message).delete()
        session.query(Conversation).delete()
        session.query(Chunk).delete()
        session.query(Document).delete()
        session.query(User).delete()

        # Seed Users
        user1 = User(
            id=str(uuid.uuid4()),
            email="alice@example.com",
            password_hash="hashed_password_1",
            role="admin",
            created_at=datetime.utcnow()
        )
        user2 = User(
            id=str(uuid.uuid4()),
            email="bob@example.com",
            password_hash="hashed_password_2",
            role="member",
            created_at=datetime.utcnow()
        )
        session.add_all([user1, user2])

        # Seed Documents
        document1 = Document(
            id=str(uuid.uuid4()),
            user_id=user1.id,
            filename="example.pdf",
            status="processed",
            chunk_count=10,
            created_at=datetime.utcnow()
        )
        document2 = Document(
            id=str(uuid.uuid4()),
            user_id=user2.id,
            filename="example.docx",
            status="processing",
            chunk_count=None,
            created_at=datetime.utcnow()
        )
        session.add_all([document1, document2])

        # Seed Chunks
        chunk1 = Chunk(
            id=str(uuid.uuid4()),
            document_id=document1.id,
            content="This is chunk 1 content.",
            chunk_index=0,
            embedding=[0.1] * 1536
        )
        chunk2 = Chunk(
            id=str(uuid.uuid4()),
            document_id=document1.id,
            content="This is chunk 2 content.",
            chunk_index=1,
            embedding=[0.2] * 1536
        )
        session.add_all([chunk1, chunk2])

        # Seed Conversations
        conversation1 = Conversation(
            id=str(uuid.uuid4()),
            user_id=user1.id,
            title="First Conversation",
            created_at=datetime.utcnow()
        )
        session.add(conversation1)

        # Seed Messages
        message1 = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation1.id,
            role="user",
            content="What is the content of chunk 1?",
            sources={"chunks": [chunk1.id]},
            created_at=datetime.utcnow()
        )
        message2 = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation1.id,
            role="assistant",
            content="Chunk 1 contains: This is chunk 1 content.",
            sources={"chunks": [chunk1.id]},
            created_at=datetime.utcnow()
        )
        session.add_all([message1, message2])

        session.commit()
    finally:
        session.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_database()