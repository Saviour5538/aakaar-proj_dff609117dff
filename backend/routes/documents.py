from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from database.models import Document
from database.config import get_db
from backend.services.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/documents")

class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    status: str
    chunk_count: int
    created_at: str

@router.post("/upload", operation_id="uploadDocument", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        # Save document metadata to the database
        document = Document(
            user_id=current_user["id"],
            filename=file.filename,
            status="uploaded",
            chunk_count=0,
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return {"message": "Document uploaded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload document")

@router.get("/", operation_id="listDocuments", response_model=List[DocumentResponse])
async def list_documents(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        documents = db.query(Document).filter(Document.user_id == current_user["id"]).all()
        return [
            DocumentResponse(
                id=document.id,
                filename=document.filename,
                status=document.status,
                chunk_count=document.chunk_count,
                created_at=document.created_at.isoformat(),
            )
            for document in documents
        ]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch documents")

@router.delete("/{id}", operation_id="deleteDocument", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        document = db.query(Document).filter(Document.id == id, Document.user_id == current_user["id"]).first()
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
        db.delete(document)
        db.commit()
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete document")