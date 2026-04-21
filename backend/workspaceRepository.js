import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebaseAdmin.js';
import { normalizeState, uid } from './workspaceState.js';

const workspaceCollection = 'agrobalanceWorkspaces';

export const getWorkspaceRef = (workspaceId) => db.collection(workspaceCollection).doc(workspaceId);

export const getWorkspaceState = async (workspaceId) => {
  const snapshot = await getWorkspaceRef(workspaceId).get();
  if (!snapshot.exists) {
    throw new Error(`No existe el workspace "${workspaceId}" en Firestore.`);
  }

  return normalizeState(snapshot.data()?.state);
};

export const appendItemToCollection = async (workspaceId, collection, payload, metadata = {}) => {
  const ref = getWorkspaceRef(workspaceId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      throw new Error(`No existe el workspace "${workspaceId}" en Firestore.`);
    }

    const workspace = normalizeState(snapshot.data()?.state);
    const nextItem = {
      id: uid(collection),
      ...payload
    };

    workspace[collection] = [...workspace[collection], nextItem];

    transaction.set(ref, {
      state: workspace,
      workspaceId,
      updatedAt: FieldValue.serverTimestamp(),
      lastInboundMessage: metadata
    }, { merge: true });

    return nextItem;
  });
};
