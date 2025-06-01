'use client';
import { useParams } from 'next/navigation';
import { ChangeEventHandler, useEffect, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Pagination from 'rc-pagination';
// 2025 import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
const MapLeaflet = dynamic(() => import('@/components/Map'), {
  ssr: false,
});



import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 마커 아이콘이 안 나오는 문제 해결
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});



import ChartCurrent from '@/components/Chart/ChartCurrent';
import ChartEnergyConsumption from '@/components/Chart/ChartEnergyConsumption';
import ChartTemperatureHumidity from '@/components/Chart/ChartTemperatureHumidity';
import ChartVoltage from '@/components/Chart/ChartVoltage';

import {
  getData,
  getDeviceCurrent,
  getDeviceCurrentUrls,
  getDeviceTemperature,
  getDeviceTemperatureUrls,
  getDeviceVoltage,
  getDeviceVoltageUrls,
  getLocation,
  getBulbBright,
  getBulbStatus,
  getSwitchStatus,
  switchBulbStatus,
  switchSwitchStatus,
  updateBulbBright,
  getDeviceEnergyConsumptionUrls,
  getDeviceEnergyConsumption,
} from '@/lib/api/device';

import { env } from '@/env';
import { safeSessionStorage } from '@toss/storage';

export default function HomePage() {
  const params = useParams();
  const deviceName = params.deviceName as string;

  // location
  const { data: deviceLocation } = useQuery({
    queryKey: ['deviceLocation', deviceName],
    queryFn: () =>
      getLocation({
        deviceName,
      }),
  });

  // voltage
  const [deviceVoltageData, setDeviceVoltageData] = useState<
    { x: string; y: string | number }[]
  >([]);

  const { data: DeviceVoltageUrls } = useQuery<string[]>({
    queryKey: ['deviceVoltageUrls', deviceName],
    queryFn: () =>
      getDeviceVoltageUrls({
        deviceName,
        lim: '10',
      }),
  });

  // voltage
  const [deviceEnergyConsumptionData, setDeviceEnergyConsumptionData] =
    useState<{ x: string; y: string | number }[]>([]);

  const { data: DeviceEnergyConsumptionUrls } = useQuery<string[]>({
    queryKey: ['deviceEnergyConsumptionUrls', deviceName],
    queryFn: () =>
      getDeviceEnergyConsumptionUrls({
        deviceName,
        lim: '10',
      }),
  });

  const { data: deviceBulbStatus, refetch: refetchDeviceBulbStatus } = useQuery(
    {
      queryKey: ['deviceBulbStatus', deviceName],
      queryFn: () =>
        getBulbStatus({
          deviceName,
        }),
    },
  );

  const { data: deviceBulbBright, refetch: refetchDeviceBulbBright } = useQuery(
    {
      queryKey: ['deviceBulbBright', deviceName],
      queryFn: () =>
        getBulbBright({
          deviceName,
        }),
    },
  );

  const { data: deviceSwitchStatus, refetch: refetchDeviceSwitchStatus } =
    useQuery({
      queryKey: ['deviceSwitchStatus', deviceName],
      queryFn: () =>
        getSwitchStatus({
          deviceName,
        }),
    });

  const { mutate: switchBulbStatusMutate } = useMutation({
    mutationFn: switchBulbStatus,
    onSuccess: () => {
      refetchDeviceBulbStatus();
    },
  });

  const onSwitchBulbStatus: ChangeEventHandler<HTMLInputElement> = (e) => {
    switchBulbStatusMutate({
      deviceName,
      status: e.target.checked ? 'on' : 'off',
    });
  };

  const { mutate: switchSwitchStatusMutate } = useMutation({
    mutationFn: switchSwitchStatus,
    onSuccess: () => {
      refetchDeviceSwitchStatus();
    },
  });

  const onSwitchSwitchStatus: ChangeEventHandler<HTMLInputElement> = (e) => {
    switchSwitchStatusMutate({
      deviceName,
      status: e.target.checked ? 'on' : 'off',
    });
  };

  const [bulbBright, setBulbBright] = useState<string>();

  useEffect(() => {
    if (!deviceBulbBright) {
      return;
    }
    setBulbBright(deviceBulbBright.con);
  }, [deviceBulbBright]);

  const { mutate: updateBulbBrightMutate } = useMutation({
    mutationFn: updateBulbBright,
    onSuccess: () => {
      alert('적용되었습니다.');
      refetchDeviceBulbBright();
    },
  });

  const onSetBulbBright = () => {
    updateBulbBrightMutate({
      deviceName,
      bright: bulbBright as string,
    });
  };

  const onChangeBulbBright: ChangeEventHandler<HTMLInputElement> = (e) => {
    console.log(e.target.value);
  };

  useEffect(() => {
    if (DeviceVoltageUrls) {
      Promise.all(DeviceVoltageUrls.map((url) => getData(url))).then((data) => {
        setDeviceVoltageData(
          data.map((entry) => ({
            x: dayjs(entry.ct).toISOString(),
            y: entry.con,
          })),
        );
      });
    }

    const interval = setInterval(
      async () => {
        const latestDevice = await getDeviceVoltage({
          deviceName,
        });

        if (latestDevice) {
          setDeviceVoltageData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [DeviceVoltageUrls]);

  // energy consumption
  useEffect(() => {
    if (DeviceEnergyConsumptionUrls) {
      Promise.all(DeviceEnergyConsumptionUrls.map((url) => getData(url))).then(
        (data) => {
          setDeviceEnergyConsumptionData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    const interval = setInterval(
      async () => {
        const latestDevice = await getDeviceEnergyConsumption({
          deviceName,
        });

        if (latestDevice) {
          setDeviceEnergyConsumptionData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [DeviceEnergyConsumptionUrls]);

  // current
  const [deviceCurrentData, setDeviceCurrentData] = useState<
    { x: string; y: string | number }[]
  >([]);

  const { data: DeviceCurrentUrls } = useQuery<string[]>({
    queryKey: ['deviceCurrentUrls', deviceName],
    queryFn: () =>
      getDeviceCurrentUrls({
        deviceName,
        lim: '10',
      }),
  });

  useEffect(() => {
    if (DeviceCurrentUrls) {
      Promise.all(DeviceCurrentUrls.map((url) => getData(url))).then((data) => {
        setDeviceCurrentData(
          data.map((entry) => ({
            x: dayjs(entry.ct).toISOString(),
            y: entry.con,
          })),
        );
      });
    }

    const interval = setInterval(
      async () => {
        const latestDevice = await getDeviceCurrent({
          deviceName,
        });

        if (latestDevice) {
          setDeviceCurrentData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [DeviceCurrentUrls]);

  // temperature
  const [deviceTemperatureData, setDeviceTemperatureData] = useState<
    Array<{ x: string; y: string | number }>
  >([]);

  const { data: deviceTemperatureUrls } = useQuery<string[]>({
    queryKey: ['deviceTemperatureUrls', deviceName],
    queryFn: () =>
      getDeviceTemperatureUrls({
        deviceName,
        lim: '10',
      }),
  });

  useEffect(() => {
    if (deviceTemperatureUrls) {
      Promise.all(deviceTemperatureUrls.map((url) => getData(url))).then(
        (data) => {
          setDeviceTemperatureData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    const interval = setInterval(
      async () => {
        const latestDevice = await getDeviceTemperature({
          deviceName,
        });

        if (latestDevice) {
          setDeviceTemperatureData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [deviceTemperatureUrls]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* voltage */}
      <ChartVoltage
        series={[{ name: deviceName, data: deviceVoltageData, color: 'red' }]}
      />
      {/* energy consumption */}
      <ChartEnergyConsumption
        series={[
          { name: deviceName, data: deviceEnergyConsumptionData, color: 'red' },
        ]}
      />
<MapLeaflet
  center={[37.5509, 127.0738]}
  zoom={12}
  markers={[
    {
      lat: 37.5509,
      lng: 127.0738,
      label: '세종대학교',
    },
  ]}
/>


      {/* current */}
      <ChartCurrent
        series={[{ name: deviceName, data: deviceCurrentData, color: 'red' }]}
      />
      {/* temperature humidity */}
      <ChartTemperatureHumidity
        series={[
          { name: deviceName, data: deviceTemperatureData, color: 'red' },
        ]}
      />
      <div className="rounded-2xl border p-4 shadow-lg">
        <div className="text-[20px] font-bold">On/Off</div>
        <div className="mt-[12px] flex items-center gap-[12px]">
          <div className="min-w-[75px] font-medium">스위치 상태</div>
          <input
            type="checkbox"
            className="toggle toggle-success toggle-md"
            checked={deviceSwitchStatus?.con === 'on'}
            onChange={onSwitchSwitchStatus}
          />
        </div>
        <div className="mt-[12px] flex items-center gap-[12px]">
          <div className="min-w-[75px] font-medium">전구 상태</div>
          <input
            type="checkbox"
            className="toggle toggle-success toggle-md"
            checked={deviceBulbStatus?.con === 'on'}
            onChange={onSwitchBulbStatus}
          />
        </div>
        <div className="mt-[12px] flex items-center gap-[12px]">
          <div className="min-w-[75px] font-medium">전구 밝기</div>
          <input
            type="number"
            className="input input-sm input-bordered w-[70px]"
            min={0}
            max={100}
            value={bulbBright}
            onChange={(e) => setBulbBright(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={onSetBulbBright}>
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
