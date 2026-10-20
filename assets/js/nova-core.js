/**
 * Nova Core — local-first, versioned state store.
 * No network calls, analytics, credentials, or remote sharing.
 * Storage is local to the browser origin; export backups deliberately.
 */
const FORMAT = "nova-state";
const VERSION = 1;
const DEFAULT_KEY = "nova.core.state.v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateEnvelope(value) {
  if (!value || value.format !== FORMAT || value.version !== VERSION ||
      !value.state || typeof value.state !== "object" ||
      !Array.isArray(value.checkpoints)) {
    throw new TypeError("Arquivo Nova inválido ou versão não suportada.");
  }
  return value;
}

function makeEnvelope(state, checkpoints = []) {
  return {
    format: FORMAT,
    version: VERSION,
    updatedAt: new Date().toISOString(),
    state: clone(state),
    checkpoints: clone(checkpoints)
  };
}

export function createNovaCore(options = {}) {
  const key = options.key || DEFAULT_KEY;
  const storage = options.storage === undefined
    ? (typeof localStorage === "undefined" ? null : localStorage)
    : options.storage;

  function readEnvelope() {
    if (!storage) return makeEnvelope({ notes: [], projects: {}, preferences: {} });
    const raw = storage.getItem(key);
    if (!raw) return makeEnvelope({ notes: [], projects: {}, preferences: {} });
    try {
      return validateEnvelope(JSON.parse(raw));
    } catch (error) {
      throw new Error("Não foi possível ler o estado salvo da Nova. Exporte/recupere um backup antes de sobrescrever.", { cause: error });
    }
  }

  function writeEnvelope(envelope) {
    if (!storage) throw new Error("Armazenamento local indisponível neste ambiente.");
    storage.setItem(key, JSON.stringify(envelope));
    return clone(envelope);
  }

  return Object.freeze({
    status() {
      return {
        storageAvailable: Boolean(storage),
        key,
        format: FORMAT,
        version: VERSION,
        updatedAt: readEnvelope().updatedAt
      };
    },

    read() {
      return clone(readEnvelope().state);
    },

    update(mutator) {
      if (typeof mutator !== "function") throw new TypeError("update espera uma função.");
      const envelope = readEnvelope();
      const draft = clone(envelope.state);
      const result = mutator(draft);
      const nextState = result === undefined ? draft : result;
      if (!nextState || typeof nextState !== "object" || Array.isArray(nextState)) {
        throw new TypeError("O estado da Nova deve ser um objeto.");
      }
      return writeEnvelope(makeEnvelope(nextState, envelope.checkpoints)).state;
    },

    checkpoint(label = "checkpoint") {
      const envelope = readEnvelope();
      const checkpoint = {
        id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: String(label).slice(0, 120),
        createdAt: new Date().toISOString(),
        state: clone(envelope.state)
      };
      const checkpoints = [...envelope.checkpoints, checkpoint].slice(-30);
      writeEnvelope(makeEnvelope(envelope.state, checkpoints));
      return clone(checkpoint);
    },

    listCheckpoints() {
      return clone(readEnvelope().checkpoints).map(({ id, label, createdAt }) => ({ id, label, createdAt }));
    },

    restore(checkpointId) {
      const envelope = readEnvelope();
      const checkpoint = envelope.checkpoints.find(item => item.id === checkpointId);
      if (!checkpoint) throw new Error("Checkpoint não encontrado.");
      const previous = {
        id: `cp-${Date.now()}-before-restore`,
        label: "estado anterior à restauração",
        createdAt: new Date().toISOString(),
        state: clone(envelope.state)
      };
      writeEnvelope(makeEnvelope(checkpoint.state, [...envelope.checkpoints, previous].slice(-30)));
      return clone(checkpoint.state);
    },

    exportJSON() {
      return JSON.stringify(readEnvelope(), null, 2);
    },

    importJSON(jsonText) {
      const parsed = validateEnvelope(JSON.parse(jsonText));
      // Keep the import explicit: this method is only called by the app/user.
      return writeEnvelope(makeEnvelope(parsed.state, parsed.checkpoints));
    },

    clear() {
      if (!storage) throw new Error("Armazenamento local indisponível.");
      storage.removeItem(key);
      return true;
    }
  });
}

export const novaCoreVersion = VERSION;
