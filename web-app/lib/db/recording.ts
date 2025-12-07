import { getSession } from '../neo4j';

export interface Recording {
  id: string;
  visitId: string;
  audioData?: string; // Base64 encoded audio or URL to storage
  transcription: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createRecording(
  visitId: string,
  audioData: string | undefined,
  transcription: string
): Promise<Recording> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      CREATE (r:Recording {
        id: randomUUID(),
        visitId: $visitId,
        audioData: $audioData,
        transcription: $transcription,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN r
      `,
      { visitId, audioData, transcription }
    );

    const node = result.records[0].get('r');
    return {
      id: node.properties.id,
      visitId: node.properties.visitId,
      audioData: node.properties.audioData,
      transcription: node.properties.transcription,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function getRecordingsByVisit(visitId: string): Promise<Recording[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (r:Recording {visitId: $visitId})
      RETURN r
      ORDER BY r.createdAt ASC
      `,
      { visitId }
    );

    return result.records.map(record => {
      const node = record.get('r');
      return {
        id: node.properties.id,
        visitId: node.properties.visitId,
        audioData: node.properties.audioData,
        transcription: node.properties.transcription,
        createdAt: new Date(node.properties.createdAt),
        updatedAt: new Date(node.properties.updatedAt),
      };
    });
  } finally {
    await session.close();
  }
}

export async function getRecordingById(id: string): Promise<Recording | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (r:Recording {id: $id})
      RETURN r
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('r');
    return {
      id: node.properties.id,
      visitId: node.properties.visitId,
      audioData: node.properties.audioData,
      transcription: node.properties.transcription,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function updateRecording(
  id: string,
  audioData: string | undefined,
  transcription: string
): Promise<Recording> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (r:Recording {id: $id})
      SET r.audioData = $audioData, r.transcription = $transcription, r.updatedAt = datetime()
      RETURN r
      `,
      { id, audioData, transcription }
    );

    const node = result.records[0].get('r');
    return {
      id: node.properties.id,
      visitId: node.properties.visitId,
      audioData: node.properties.audioData,
      transcription: node.properties.transcription,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}
