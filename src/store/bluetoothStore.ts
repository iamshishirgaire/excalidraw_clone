import { create } from "zustand";
import { useDrawingStore } from "./drawingStore";
import { useCoordinateStore } from "./coordinateStore";
import { tools } from "@/lib/tools";

interface BluetoothState {
  device: BluetoothDevice | null;
  error: string | null;
  connectToDevice: () => Promise<void>;
  characteristics: Record<string, DataView | null>; // To store values for characteristics

  disconnectDevice: () => void;
}
export const BLUETOOTH_SERVICES = {
  COORDINATES: {
    SERVICE: "12345678-1234-1234-1234-1234567890ab",
    CHARACTERISTIC: "abcd1234-5678-9abc-def0-1234567890ab",
  },
  ZOOM: {
    SERVICE: "87654321-4321-4321-4321-9876543210ac",
    CHARACTERISTIC: "fedcba98-7654-3210-0987-654321fedcbb",
  },
  MODE: {
    SERVICE: "56781234-1234-1234-1234-1234567890ac",
    CHARACTERISTIC: "dcba1234-5678-9abc-def0-1234567890ac",
  },
  REDO_UNDO: {
    SERVICE: "98765432-4321-4321-4321-1234567890ab",
    CHARACTERISTIC: "efdcba98-7654-3210-0987-654321fedcbb",
  },
} as const;

export const useBluetoothStore = create<BluetoothState>((set, get) => ({
  disconnectDevice() {},
  device: null,
  error: null,
  characteristics: {},

  connectToDevice: async () => {
    try {
      const services = [
        {
          service: "12345678-1234-1234-1234-1234567890ab",
          characteristic: "abcd1234-5678-9abc-def0-1234567890ab",
        },
        {
          service: "87654321-4321-4321-4321-9876543210ac",
          characteristic: "fedcba98-7654-3210-0987-654321fedcbb",
        },
        {
          service: "56781234-1234-1234-1234-1234567890ac",
          characteristic: "dcba1234-5678-9abc-def0-1234567890ac",
        },
        {
          service: "98765432-4321-4321-4321-1234567890ab",
          characteristic: "efdcba98-7654-3210-0987-654321fedcbb",
        },
      ];
      const selectedDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [services[0].service] }],
        optionalServices: services.map((s) => s.service),
      });

      if (!selectedDevice) {
        throw new Error("No device selected");
      }
      set({
        device: selectedDevice,
        error: null,
      });

      const server = await selectedDevice.gatt?.connect();

      for (const { service, characteristic } of services) {
        try {
          if (!server) {
            throw new Error("GATT server not connected");
          }
          const primaryService = await server.getPrimaryService(service);
          if (!primaryService) {
            throw new Error(`Could not get primary service: ${service}`);
          }
          const char = await primaryService.getCharacteristic(characteristic);
          if (!char) {
            throw new Error(`Could not get characteristic: ${characteristic}`);
          }

          await char.startNotifications();
          console.log(
            `Started notifications for characteristic: ${characteristic}`
          );

          char.addEventListener("characteristicvaluechanged", (event) => {
            const target = event.target as BluetoothRemoteGATTCharacteristic;
            const value = target.value;
            if (!value) {
              console.warn("Received null value from characteristic");
              return;
            }
            const decodedValue = new TextDecoder().decode(value);
            switch (characteristic) {
              case BLUETOOTH_SERVICES.COORDINATES.CHARACTERISTIC:
                //console it
                console.log("Coordinates", JSON.parse(decodedValue));
                useCoordinateStore
                  .getState()
                  .setCoordinates(
                    JSON.parse(decodedValue).X,
                    JSON.parse(decodedValue).Y
                  );
                break;

              case BLUETOOTH_SERVICES.MODE.CHARACTERISTIC:
                useDrawingStore
                  .getState()
                  .setTool(tools[parseInt(JSON.parse(decodedValue).mode)].tool);
                break;

              case BLUETOOTH_SERVICES.REDO_UNDO.CHARACTERISTIC:
                console.log("Redo/Undo", JSON.parse(decodedValue).action);

                if (JSON.parse(decodedValue).action === 1) {
                  useDrawingStore.getState().undo();
                } else if (JSON.parse(decodedValue).action === 0) {
                  useDrawingStore.getState().redo();
                } else if (JSON.parse(decodedValue).action === 2) {
                  useDrawingStore.getState().reset();
                }

                break;

              case BLUETOOTH_SERVICES.ZOOM.CHARACTERISTIC:
                useDrawingStore
                  .getState()
                  .setZoom(
                    Math.max(40, parseInt(JSON.parse(decodedValue).zoom))
                  );
                break;
            }

            set((state) => ({
              characteristics: {
                ...state.characteristics,
                [characteristic]: value,
              },
            }));
          });
        } catch (error) {
          console.error(
            `Error setting up characteristic ${characteristic}:`,
            error
          );
        }
      }

      selectedDevice.addEventListener("gattserverdisconnected", () => {
        set({ device: null });
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    } catch (error: any) {
      setTimeout(() => set({ error: null }), 3000); // Clear error after 3 seconds
    }
  },

  // Add cleanup and optimization
  cleanup: () => {
    const state = get();
    if (state.device?.gatt?.connected) {
      state.device.gatt.disconnect();
    }
    set({
      device: null,
      error: null,
      characteristics: {},
    });
  },

  // Optimize characteristic updates
  handleCharacteristicUpdate: (characteristic: string, value: DataView) => {
    const decodedValue = new TextDecoder().decode(value);
    const parsedValue = JSON.parse(decodedValue);

    // Use a switch statement for better performance
    switch (characteristic) {
      case BLUETOOTH_SERVICES.COORDINATES.CHARACTERISTIC:
        requestAnimationFrame(() => {
          useCoordinateStore
            .getState()
            .setCoordinates(parsedValue.X, parsedValue.Y);
        });
        break;
      // ... other cases
    }
  },
}));
