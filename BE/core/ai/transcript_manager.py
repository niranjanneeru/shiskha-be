import logging
from typing import Dict, List, Any, Optional, Union
import weaviate
from weaviate import Client
from weaviate.classes.query import Filter
from weaviate.auth import Auth
from weaviate.classes.config import Configure, Property, DataType
from langchain_openai import OpenAIEmbeddings
import weaviate.classes.query as wq

from core.config import config

# Headers for OpenAI integration with Weaviate
headers = {
    "X-OpenAI-Api-Key": config.OPENAI_API_KEY,
}


class TranscriptManager:
    """
    Class to manage course transcripts in a Weaviate vector database.
    It handles the creation of schema, and provides CRUD operations for transcripts.
    """

    def __init__(self, weaviate_url: str, collection_name: str = "Transcripts"):
        """
        Initialize TranscriptManager with connection to Weaviate.

        Args:
            weaviate_url: URL to the Weaviate instance
            collection_name: Name of the collection to store transcripts
        """
        self.logger = logging.getLogger(__name__)
        self.collection_name = collection_name
        self.client = None
        self.collection = None

        # Connect to the Weaviate instance
        self._connect_to_weaviate(weaviate_url)

        # Initialize the embedding model
        self._initialize_embedding_model()

        # Ensure the schema exists
        self._ensure_schema_exists()

    def _connect_to_weaviate(self, weaviate_url: str) -> None:
        """
        Connect to Weaviate and verify the connection.

        Args:
            weaviate_url: URL to the Weaviate instance

        Raises:
            Exception: If connection fails
        """
        try:
            self.client = weaviate.connect_to_weaviate_cloud(
                cluster_url=weaviate_url,
                auth_credentials=Auth.api_key(config.WEAVIATE_API_KEY),
                headers=headers,
            )

            # Verify connection by checking if the client is alive
            if not self.client.is_ready():
                raise ConnectionError("Weaviate server is not ready")

            self.logger.info(f"Successfully connected to Weaviate at {weaviate_url}")
        except Exception as e:
            self.logger.error(f"Failed to connect to Weaviate: {e}")
            raise

    def _initialize_embedding_model(self) -> None:
        """
        Initialize the OpenAI embedding model.

        Raises:
            Exception: If initialization fails
        """
        try:
            self.embedding_model = OpenAIEmbeddings(
                model="text-embedding-3-small",
                api_key=config.OPENAI_API_KEY,
            )
            self.logger.info("Initialized OpenAI embedding model: text-embedding-3-small")
        except Exception as e:
            self.logger.error(f"Failed to initialize OpenAI embedding model: {e}")
            raise

    def _ensure_schema_exists(self) -> None:
        """
        Check if the collection exists, if not create it with the required schema.
        """
        try:
            # Check if collection exists
            collections = self.client.collections.list_all()

            # Check if 'Transcripts' exists as a key in the collections dictionary
            collection_exists = self.collection_name in collections

            print(collection_exists)

            if not collection_exists:
                self.logger.info(f"Creating collection '{self.collection_name}'")
                # Define the transcript schema with correct property format
                self.client.collections.create(
                    name=self.collection_name,
                    properties=[
                        {
                            "name": "course_id",
                            "data_type": DataType.INT,
                            "description": "The ID of the course",
                        },
                        {
                            "name": "course_transcript_id",
                            "data_type": DataType.INT,
                            "description": "The ID of the transcript within the course (0 to n)",
                        },
                        {
                            "name": "transcript_id",  # Renamed from 'id' as it's a reserved name
                            "data_type": DataType.INT,
                            "description": "Global continuous ID for the transcript",
                        },
                        {
                            "name": "text",
                            "data_type": DataType.TEXT,
                            "description": "The content of the transcript",
                        },
                        {
                            "name": "start_time",
                            "data_type": DataType.INT,
                            "description": "Start time of the transcript in seconds",
                        },
                        {
                            "name": "end_time",
                            "data_type": DataType.INT,
                            "description": "End time of the transcript in seconds",
                        },
                    ],
                )
                self.logger.info(f"Collection '{self.collection_name}' created successfully")
            else:
                self.logger.info(f"Collection '{self.collection_name}' already exists")

            # Get a reference to the collection for subsequent operations
            self.collection = self.client.collections.get(self.collection_name)

        except Exception as e:
            self.logger.error(f"Error ensuring schema exists: {e}")
            raise

    def create_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for the given text using the OpenAI embedding model.

        Args:
            text: The text to generate embeddings for

        Returns:
            The embedding vector as a list of floats
        """
        try:
            embeddings = self.embedding_model.embed_query(text)
            return embeddings
        except Exception as e:
            self.logger.error(f"Error generating embedding: {e}")
            raise

    def vector_insert(self, properties: Dict[str, Any], text: str) -> str:
        """
        Insert a new object with vector embedding into the collection.

        Args:
            properties: Dictionary of properties to insert
            text: Text to generate embedding for

        Returns:
            UUID of the inserted object
        """
        try:
            # Generate vector embedding
            vector = self.create_embedding(text)

            # Insert into Weaviate with the vector
            uuid = self.collection.data.insert(
                properties=properties,
                vector=vector
            )

            self.logger.info(f"Inserted object with properties: {properties}")
            return uuid
        except Exception as e:
            self.logger.error(f"Error inserting vector object: {e}")
            raise

    def vector_delete(self, uuid: str) -> bool:
        """
        Delete an object by UUID.

        Args:
            uuid: UUID of the object to delete

        Returns:
            True if deletion was successful
        """
        try:
            self.collection.data.delete(uuid)
            self.logger.info(f"Deleted object with UUID: {uuid}")
            return True
        except Exception as e:
            self.logger.error(f"Error deleting object: {e}")
            raise

    def build_filters(self, **kwargs) -> Optional[Filter]:
        """
        Build filters for Weaviate queries based on keyword arguments.
        Multiple filters are combined with AND operators.

        Args:
            **kwargs: Key-value pairs for filtering where key is the property name
                    and value is the value to filter by

        Returns:
            Weaviate Filter object or None if no filters provided
        """
        if not kwargs:
            return None

        combined_filter = None

        for key, value in kwargs.items():
            # Create a filter for this key-value pair
            current_filter = Filter.by_property(key).equal(value)

            # If this is the first filter, use it as the starting point
            if combined_filter is None:
                combined_filter = current_filter
            # Combine with AND operator
            else:
                combined_filter = Filter.by_operator("and").add_filter(
                    combined_filter
                ).add_filter(
                    current_filter
                )

        return combined_filter

    def vector_search(self, query_text: str, limit: int = 5, **filter_kwargs) -> List[Dict[str, Any]]:
        """
        Search for objects by vector similarity with optional filters.

        Args:
            query_text: The search query text
            limit: Maximum number of results to return
            **filter_kwargs: Keyword arguments for filtering results (property=value)

        Returns:
            List of matching objects sorted by relevance
        """
        try:
            # Generate query embedding
            query_vector = self.create_embedding(query_text)

            # Build filters from kwargs
            filters = self.build_filters(**filter_kwargs)

            # Perform vector search
            if filters:
                response = self.collection.query.near_vector(
                    near_vector=query_vector,
                    filters=filters,
                    limit=limit,
                    return_metadata=wq.MetadataQuery(distance=True),
                )
            else:
                response = self.collection.query.near_vector(
                    near_vector=query_vector,
                    limit=limit,
                    return_metadata=wq.MetadataQuery(distance=True),
                )

            if not response or len(response.objects) == 0:
                return []

            # Format results
            results = []
            for obj in response.objects:
                distance = obj.metadata.distance
                similarity = 1 - distance  # Convert distance to similarity score
                results.append({
                    "uuid": obj.uuid,
                    "similarity": round(similarity, 4),
                    **obj.properties
                })

            return results

        except Exception as e:
            self.logger.error(f"Error searching objects: {e}")
            raise

    def most_similar_content(self, query_text: str, **filter_kwargs) -> Optional[str]:
        """
        Find the most similar content to the query text.

        Args:
            query_text: The search query text
            **filter_kwargs: Keyword arguments for filtering results (property=value)

        Returns:
            The text of the most similar transcript or None if no results are found
        """
        try:
            # Call vector_search with limit as 1
            results = self.vector_search(query_text, limit=1, **filter_kwargs)

            # Return the text key's data from the first result
            if results:
                return results[0].get("text")
            return None
        except Exception as e:
            self.logger.error(f"Error finding most similar content: {e}")
            raise

    def get_next_id(self) -> int:
        """
        Get the next available global ID.

        Returns:
            The next available global ID
        """
        try:
            # Query to find the maximum transcript_id value (renamed from 'id')
            response = self.collection.query.aggregate(aggregate_property="transcript_id", group_by=["transcript_id"])

            # If no records exist yet, start with ID 1
            if not response or len(response) == 0:
                return 1

            # Find the maximum ID
            max_id = max([item.transcript_id for item in response])
            return max_id + 1

        except Exception as e:
            self.logger.error(f"Error getting next ID: {e}")
            return 1  # Default to 1 if something goes wrong

    def get_next_course_transcript_id(self, course_id: int) -> int:
        """
        Get the next available course_transcript_id for a specific course.

        Args:
            course_id: The ID of the course

        Returns:
            The next available course_transcript_id (0 to n)
        """
        try:
            # Query to find transcripts for this course
            response = self.collection.query.fetch_objects(
                filters=Filter.by_property("course_id").equal(course_id)
            )

            # If no transcripts exist for this course, start with ID 0
            if not response or len(response.objects) == 0:
                return 0

            # Find the maximum course_transcript_id
            transcript_ids = [obj.properties["course_transcript_id"] for obj in response.objects]
            return max(transcript_ids) + 1

        except Exception as e:
            self.logger.error(f"Error getting next course transcript ID: {e}")
            return 0  # Default to 0 if something goes wrong

    def create_transcript(self, course_id: int, text: str,
                          transcript_id: Optional[int] = None,
                          course_transcript_id: Optional[int] = None,
                          start_time: Optional[int] = None,
                          end_time: Optional[int] = None) -> Dict[str, Any]:
        """
        Create a new transcript in the collection.

        Args:
            course_id: The ID of the course
            text: The content of the transcript
            transcript_id: Optional global ID (if not provided, will be auto-generated)
            course_transcript_id: Optional transcript ID within the course (if not provided, will be auto-generated)
            start_time: Optional start time of the transcript in seconds
            end_time: Optional end time of the transcript in seconds

        Returns:
            The created transcript data with UUID
        """
        try:
            # Auto-generate IDs if not provided
            if transcript_id is None:
                transcript_id = self.get_next_id()

            if course_transcript_id is None:
                course_transcript_id = self.get_next_course_transcript_id(course_id)

            # Prepare transcript data
            transcript_data = {
                "course_id": course_id,
                "course_transcript_id": course_transcript_id,
                "transcript_id": transcript_id,  # Renamed from 'id'
                "text": text,
                "start_time": start_time or 0,
                "end_time": end_time or 0,
            }

            # Insert using vector_insert function
            uuid = self.vector_insert(transcript_data, text)

            self.logger.info(f"Created transcript with ID {transcript_id} for course {course_id}")
            return {**transcript_data, "uuid": uuid}

        except Exception as e:
            self.logger.error(f"Error creating transcript: {e}")
            raise

    def get_transcript(self, transcript_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve a transcript by its global ID.

        Args:
            transcript_id: Global ID of the transcript

        Returns:
            The transcript data or None if not found
        """
        try:
            response = self.collection.query.fetch_objects(
                filters=Filter.by_property("transcript_id").equal(transcript_id)
            )

            if not response or len(response.objects) == 0:
                self.logger.warning(f"Transcript with ID {transcript_id} not found")
                return None

            obj = response.objects[0]
            return {
                "uuid": obj.uuid,
                **obj.properties
            }

        except Exception as e:
            self.logger.error(f"Error retrieving transcript: {e}")
            raise

    def get_course_transcripts(self, course_id: int) -> List[Dict[str, Any]]:
        """
        Retrieve all transcripts for a specific course.

        Args:
            course_id: The ID of the course

        Returns:
            List of transcript data for the course
        """
        try:
            response = self.collection.query.fetch_objects(
                filters=Filter.by_property("course_id").equal(course_id)
            )

            if not response or len(response.objects) == 0:
                self.logger.info(f"No transcripts found for course {course_id}")
                return []

            # Convert to list of dictionaries
            transcripts = [{"uuid": obj.uuid, **obj.properties} for obj in response.objects]
            return transcripts

        except Exception as e:
            self.logger.error(f"Error retrieving course transcripts: {e}")
            raise

    def update_transcript(self, transcript_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a transcript by its global ID.

        Args:
            transcript_id: Global ID of the transcript
            data: Dictionary containing fields to update

        Returns:
            The updated transcript data or None if not found
        """
        try:
            # First get the transcript to update
            existing = self.get_transcript(transcript_id)
            if not existing:
                self.logger.warning(f"Cannot update: Transcript with ID {transcript_id} not found")
                return None

            # Get UUID for the update operation
            uuid = existing.pop("uuid")

            # Merge existing data with updates
            updated_data = {**existing, **data}

            # If text is updated, regenerate embedding
            if "text" in data:
                vector = self.create_embedding(data["text"])
                self.collection.data.update(
                    uuid=uuid,
                    properties=updated_data,
                    vector=vector
                )
            else:
                self.collection.data.update(
                    uuid=uuid,
                    properties=updated_data
                )

            self.logger.info(f"Updated transcript with ID {transcript_id}")
            return self.get_transcript(transcript_id)

        except Exception as e:
            self.logger.error(f"Error updating transcript: {e}")
            raise

    def delete_transcript(self, transcript_id: int) -> bool:
        """
        Delete a transcript by its global ID.

        Args:
            transcript_id: Global ID of the transcript

        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # First get the transcript to delete
            existing = self.get_transcript(transcript_id)
            if not existing:
                self.logger.warning(f"Cannot delete: Transcript with ID {transcript_id} not found")
                return False

            # Get UUID for the delete operation
            uuid = existing["uuid"]

            # Delete using vector_delete function
            return self.vector_delete(uuid)

        except Exception as e:
            self.logger.error(f"Error deleting transcript: {e}")
            raise

    def __del__(self):
        """
        Destructor method to ensure proper connection cleanup.
        """
        try:
            if self.client is not None:
                self.client.close()
                self.logger.info("Weaviate client connection closed properly")
        except Exception as e:
            self.logger.error(f"Error closing Weaviate client: {e}")

    def close(self):
        """
        Explicitly close the Weaviate client connection.
        """
        try:
            if self.client is not None:
                self.client.close()
                self.client = None
                self.logger.info("Weaviate client connection closed properly")
        except Exception as e:
            self.logger.error(f"Error closing Weaviate client: {e}")
            raise