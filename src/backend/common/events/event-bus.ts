import { logger } from "@/backend/common/logging/logger";
import { DomainEvent, DomainEventMap, DomainEventName } from "@/backend/common/events/domain-events";

type DomainEventHandler<K extends DomainEventName> = (event: DomainEvent<K>) => void | Promise<void>;
type AnyDomainEventHandler = (event: DomainEvent) => void | Promise<void>;

class InMemoryEventBus {
  private handlers: Partial<Record<DomainEventName, Set<AnyDomainEventHandler>>> = {};

  on<K extends DomainEventName>(type: K, handler: DomainEventHandler<K>) {
    const bucket = (this.handlers[type] ??= new Set<AnyDomainEventHandler>());
    const castedHandler = handler as AnyDomainEventHandler;
    bucket.add(castedHandler);

    return () => {
      bucket.delete(castedHandler);
    };
  }

  async emit<K extends DomainEventName>(type: K, payload: DomainEventMap[K]) {
    const event: DomainEvent<K> = {
      type,
      payload,
      occurredAt: new Date().toISOString(),
    };

    const listeners = Array.from(this.handlers[type] ?? []) as Array<DomainEventHandler<K>>;
    if (listeners.length === 0) return;

    const result = await Promise.allSettled(listeners.map((listener) => Promise.resolve(listener(event))));

    result.forEach((entry, index) => {
      if (entry.status === "rejected") {
        logger.warn(`Event handler failed for ${type} at index ${index}`, {
          reason: entry.reason,
        });
      }
    });
  }
}

const EVENT_BUS_KEY = "__financTrackerEventBus" as const;

type EventBusGlobal = typeof globalThis & {
  [EVENT_BUS_KEY]?: InMemoryEventBus;
};

export const getEventBus = () => {
  const g = globalThis as EventBusGlobal;
  if (!g[EVENT_BUS_KEY]) {
    g[EVENT_BUS_KEY] = new InMemoryEventBus();
  }
  return g[EVENT_BUS_KEY];
};
