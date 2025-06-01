'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Pagination from 'rc-pagination';
// 2025 import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
//2025
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

import ChartCurrent from '@/components/Chart/ChartCurrent';
import ChartEnergyConsumption from '@/components/Chart/ChartEnergyConsumption';
import ChartTemperatureHumidity from '@/components/Chart/ChartTemperatureHumidity';
import ChartVoltage from '@/components/Chart/ChartVoltage';

//2025
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// 마커 아이콘 오류 방지용 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  center: [number, number];
  markers: { lat: number; lng: number; label: string }[];
}

//

import {
  getData,
  getDeviceAmperage,
  getDeviceCurrent,
  getDeviceCurrentUrls,
  getDeviceEnergyConsumption,
  getDeviceEnergyConsumptionUrls,
  getDeviceTemperature,
  getDeviceTemperatureUrls,
  getDeviceVoltage,
  getDeviceVoltageUrls,
  getLocation,
} from '@/lib/api/device';

import { env } from '@/env';
import { safeSessionStorage } from '@toss/storage';



export default function HomePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(3);

  const onChangePage = (page: number) => {
    setPage(page);
  };

  // device table
  const { data: myDevice1Voltage } = useQuery({
    queryKey: ['deviceVoltage', 'my_device1'],
    queryFn: () =>
      getDeviceVoltage({
        deviceName: 'my_device1',
      }),
  });

  const { data: myDevice2Voltage } = useQuery({
    queryKey: ['deviceVoltage', 'my_device2'],
    queryFn: () =>
      getDeviceVoltage({
        deviceName: 'my_device2',
      }),
  });

  const { data: myDevice3Voltage } = useQuery({
    queryKey: ['deviceVoltage', 'my_device3'],
    queryFn: () =>
      getDeviceVoltage({
        deviceName: 'my_device3',
      }),
  });

  const { data: myDevice1Amperage } = useQuery({
    queryKey: ['deviceAmperage', 'my_device1'],
    queryFn: () =>
      getDeviceAmperage({
        deviceName: 'my_device1',
      }),
  });

  const { data: myDevice2Amperage } = useQuery({
    queryKey: ['deviceAmperage', 'my_device2'],
    queryFn: () =>
      getDeviceAmperage({
        deviceName: 'my_device2',
      }),
  });

  const { data: myDevice3Amperage } = useQuery({
    queryKey: ['deviceAmperage', 'my_device3'],
    queryFn: () =>
      getDeviceAmperage({
        deviceName: 'my_device3',
      }),
  });

  const { data: myDevice1Location } = useQuery({
    queryKey: ['deviceLocation', 'my_device1'],
    queryFn: () =>
      getLocation({
        deviceName: 'my_device1',
      }),
  });

  const { data: myDevice2Location } = useQuery({
    queryKey: ['deviceLocation', 'my_device2'],
    queryFn: () =>
      getLocation({
        deviceName: 'my_device2',
      }),
  });

  // voltage
  const [device1VoltageData, setDevice1VoltageData] = useState<
    { x: string; y: string | number }[]
  >([]);
  const [device2VoltageData, setDevice2VoltageData] = useState<
    { x: string; y: string | number }[]
  >([]);
  const [device3VoltageData, setDevice3VoltageData] = useState<
    { x: string; y: string | number }[]
  >([]);

  const { data: DeviceVoltage1Urls } = useQuery<string[]>({
    queryKey: ['deviceVoltageUrls', 'my_device1'],
    queryFn: () =>
      getDeviceVoltageUrls({
        deviceName: 'my_device1',
        lim: '10',
      }),
  });

  const { data: DeviceVoltage2Urls } = useQuery<string[]>({
    queryKey: ['deviceVoltageUrls', 'my_device2'],
    queryFn: () =>
      getDeviceVoltageUrls({
        deviceName: 'my_device2',
        lim: '10',
      }),
  });

  const { data: DeviceVoltage3Urls } = useQuery<string[]>({
    queryKey: ['deviceVoltageUrls', 'my_device3'],
    queryFn: () =>
      getDeviceVoltageUrls({
        deviceName: 'my_device3',
        lim: '10',
      }),
  });

  useEffect(() => {
    if (DeviceVoltage1Urls) {
      Promise.all(DeviceVoltage1Urls.map((url) => getData(url))).then(
        (data) => {
          setDevice1VoltageData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (DeviceVoltage2Urls) {
      Promise.all(DeviceVoltage2Urls.map((url) => getData(url))).then(
        (data) => {
          setDevice2VoltageData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (DeviceVoltage3Urls) {
      Promise.all(DeviceVoltage3Urls.map((url) => getData(url))).then(
        (data) => {
          setDevice3VoltageData(
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
        const latestDevice1 = await getDeviceVoltage({
          deviceName: 'my_device1',
        });
        const latestDevice2 = await getDeviceVoltage({
          deviceName: 'my_device2',
        });
        const latestDevice3 = await getDeviceVoltage({
          deviceName: 'my_device3',
        });

        if (latestDevice1) {
          setDevice1VoltageData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice1.con },
          ]);
        }
        if (latestDevice2) {
          setDevice2VoltageData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice2.con },
          ]);
        }
        if (latestDevice3) {
          setDevice3VoltageData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice3.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [DeviceVoltage1Urls, DeviceVoltage2Urls, DeviceVoltage3Urls]);

  // energy consumption
  const [device1EnergyConsumptionData, setDevice1EnergyConsumptionData] =
    useState<{ x: string; y: string | number }[]>([]);
  const [device2EnergyConsumptionData, setDevice2EnergyConsumptionData] =
    useState<{ x: string; y: string | number }[]>([]);
  const [device3EnergyConsumptionData, setDevice3EnergyConsumptionData] =
    useState<{ x: string; y: string | number }[]>([]);

  const { data: DeviceEnergyConsumption1Urls } = useQuery<string[]>({
    queryKey: ['deviceEnergyConsumptionUrls', 'my_device1'],
    queryFn: () =>
      getDeviceEnergyConsumptionUrls({
        deviceName: 'my_device1',
        lim: '10',
      }),
  });

  const { data: DeviceEnergyConsumption2Urls } = useQuery<string[]>({
    queryKey: ['deviceEnergyConsumptionUrls', 'my_device2'],
    queryFn: () =>
      getDeviceEnergyConsumptionUrls({
        deviceName: 'my_device2',
        lim: '10',
      }),
  });

  const { data: DeviceEnergyConsumption3Urls } = useQuery<string[]>({
    queryKey: ['deviceEnergyConsumptionUrls', 'my_device3'],
    queryFn: () =>
      getDeviceEnergyConsumptionUrls({
        deviceName: 'my_device3',
        lim: '10',
      }),
  });

  useEffect(() => {
    if (DeviceEnergyConsumption1Urls) {
      Promise.all(DeviceEnergyConsumption1Urls.map((url) => getData(url))).then(
        (data) => {
          setDevice1EnergyConsumptionData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (DeviceEnergyConsumption2Urls) {
      Promise.all(DeviceEnergyConsumption2Urls.map((url) => getData(url))).then(
        (data) => {
          setDevice2EnergyConsumptionData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (DeviceEnergyConsumption3Urls) {
      Promise.all(DeviceEnergyConsumption3Urls.map((url) => getData(url))).then(
        (data) => {
          setDevice3EnergyConsumptionData(
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
        const latestDevice1 = await getDeviceEnergyConsumption({
          deviceName: 'my_device1',
        });
        const latestDevice2 = await getDeviceEnergyConsumption({
          deviceName: 'my_device2',
        });
        const latestDevice3 = await getDeviceEnergyConsumption({
          deviceName: 'my_device3',
        });

        if (latestDevice1) {
          setDevice1EnergyConsumptionData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice1.con },
          ]);
        }
        if (latestDevice2) {
          setDevice2EnergyConsumptionData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice2.con },
          ]);
        }
        if (latestDevice3) {
          setDevice3EnergyConsumptionData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice3.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [
    DeviceEnergyConsumption1Urls,
    DeviceEnergyConsumption2Urls,
    DeviceEnergyConsumption3Urls,
  ]);

  // current
  const [device1CurrentData, setDevice1CurrentData] = useState<
    { x: string; y: string | number }[]
  >([]);
  const [device2CurrentData, setDevice2CurrentData] = useState<
    { x: string; y: string | number }[]
  >([]);
  const [device3CurrentData, setDevice3CurrentData] = useState<
    { x: string; y: string | number }[]
  >([]);

  const { data: Device1CurrentUrls } = useQuery<string[]>({
    queryKey: ['deviceCurrentUrls', 'my_device1'],
    queryFn: () =>
      getDeviceCurrentUrls({
        deviceName: 'my_device1',
        lim: '10',
      }),
  });

  const { data: Device2CurrentUrls } = useQuery<string[]>({
    queryKey: ['deviceCurrentUrls', 'my_device2'],
    queryFn: () =>
      getDeviceCurrentUrls({
        deviceName: 'my_device2',
        lim: '10',
      }),
  });

  const { data: Device3CurrentUrls } = useQuery<string[]>({
    queryKey: ['deviceCurrentUrls', 'my_device3'],
    queryFn: () =>
      getDeviceCurrentUrls({
        deviceName: 'my_device3',
        lim: '10',
      }),
  });

  useEffect(() => {
    if (Device1CurrentUrls) {
      Promise.all(Device1CurrentUrls.map((url) => getData(url))).then(
        (data) => {
          setDevice1CurrentData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (Device2CurrentUrls) {
      Promise.all(Device2CurrentUrls.map((url) => getData(url))).then(
        (data) => {
          setDevice2CurrentData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (Device3CurrentUrls) {
      Promise.all(Device3CurrentUrls.map((url) => getData(url))).then(
        (data) => {
          setDevice3CurrentData(
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
        const latestDevice1 = await getDeviceCurrent({
          deviceName: 'my_device1',
        });
        const latestDevice2 = await getDeviceCurrent({
          deviceName: 'my_device2',
        });
        const latestDevice3 = await getDeviceCurrent({
          deviceName: 'my_device3',
        });

        if (latestDevice1) {
          setDevice1CurrentData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice1.con },
          ]);
        }
        if (latestDevice2) {
          setDevice2CurrentData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice2.con },
          ]);
        }
        if (latestDevice3) {
          setDevice3CurrentData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice3.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [Device1CurrentUrls, Device2CurrentUrls, Device3CurrentUrls]);

  // temperature
  const [device1TemperatureData, setDevice1TemperatureData] = useState<
    { x: string; y: string | number }[]
  >([]);
  const [device2TemperatureData, setDevice2TemperatureData] = useState<
    { x: string; y: string | number }[]
  >([]);
  const [device3TemperatureData, setDevice3TemperatureData] = useState<
    { x: string; y: string | number }[]
  >([]);

  const { data: device1TemperatureUrls } = useQuery<string[]>({
    queryKey: ['deviceTemperatureUrls', 'my_device1'],
    queryFn: () =>
      getDeviceTemperatureUrls({
        deviceName: 'my_device1',
        lim: '10',
      }),
  });

  const { data: device2TemperatureUrls } = useQuery<string[]>({
    queryKey: ['deviceTemperatureUrls', 'my_device2'],
    queryFn: () =>
      getDeviceTemperatureUrls({
        deviceName: 'my_device2',
        lim: '10',
      }),
  });

  const { data: device3TemperatureUrls } = useQuery<string[]>({
    queryKey: ['deviceTemperatureUrls', 'my_device3'],
    queryFn: () =>
      getDeviceTemperatureUrls({
        deviceName: 'my_device3',
        lim: '10',
      }),
  });

  useEffect(() => {
    if (device1TemperatureUrls) {
      Promise.all(device1TemperatureUrls.map((url) => getData(url))).then(
        (data) => {
          setDevice1TemperatureData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (device2TemperatureUrls) {
      Promise.all(device2TemperatureUrls.map((url) => getData(url))).then(
        (data) => {
          setDevice2TemperatureData(
            data.map((entry) => ({
              x: dayjs(entry.ct).toISOString(),
              y: entry.con,
            })),
          );
        },
      );
    }

    if (device3TemperatureUrls) {
      Promise.all(device3TemperatureUrls.map((url) => getData(url))).then(
        (data) => {
          setDevice3TemperatureData(
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
        const latestDevice1 = await getDeviceTemperature({
          deviceName: 'my_device1',
        });
        const latestDevice2 = await getDeviceTemperature({
          deviceName: 'my_device2',
        });
        const latestDevice3 = await getDeviceTemperature({
          deviceName: 'my_device3',
        });

        if (latestDevice1) {
          setDevice1TemperatureData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice1.con },
          ]);
        }
        if (latestDevice2) {
          setDevice2TemperatureData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice2.con },
          ]);
        }
        if (latestDevice3) {
          setDevice3TemperatureData((prev) => [
            ...prev,
            { x: dayjs().toISOString(), y: latestDevice3.con },
          ]);
        }
      },
      Number(safeSessionStorage.get('interval')),
    );

    return () => clearInterval(interval);
  }, [device1TemperatureUrls, device2TemperatureUrls, device2TemperatureUrls]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* voltage */}
      <ChartVoltage
        series={[
          { name: 'my_device1', data: device1VoltageData, color: 'red' },
          { name: 'my_device2', data: device2VoltageData, color: 'green' },
          { name: 'my_device3', data: device3VoltageData, color: 'blue' },
        ]}
      />
      {/* energy consumption */}
      <ChartEnergyConsumption
        series={[
          {
            name: 'my_device1',
            data: device1EnergyConsumptionData,
            color: 'red',
          },
          {
            name: 'my_device2',
            data: device2EnergyConsumptionData,
            color: 'green',
          },
          {
            name: 'my_device3',
            data: device3EnergyConsumptionData,
            color: 'blue',
          },
        ]}
      />
      {/* device table */}
      <div className="rounded-2xl border p-4 shadow-lg">
        <div className="text-[20px] font-bold">Energy Meters</div>
        <table className="table mt-6">
          <thead>
            <tr>
              <th>Name</th>
              {/* <th>Label</th> */}
              <th>Voltage, V</th>
              <th>Amperage, V</th>
              <th>Power, W</th>
            </tr>
          </thead>
          <tbody>
            <tr
              className="cursor-pointer"
              onClick={() => router.push('/device/my_device1')}
            >
              <th>my_device1</th>
              {/* <td>1st Floor</td> */}
              <td>{myDevice1Voltage?.con ?? 'null'}</td>
              <td>{myDevice1Amperage?.con ?? 'null'}</td>
              <td>
                {myDevice1Voltage && myDevice1Amperage
                  ? myDevice1Voltage.con * myDevice1Amperage.con
                  : 'null'}
              </td>
            </tr>
            <tr
              className="cursor-pointer"
              onClick={() => router.push('/device/my_device2')}
            >
              <th>my_device2</th>
              {/* <td>2nd Floor</td> */}
              <td>{myDevice2Voltage?.con ?? 'null'}</td>
              <td>{myDevice2Amperage?.con ?? 'null'}</td>
              <td>
                {myDevice2Voltage && myDevice2Amperage
                  ? myDevice2Voltage.con * myDevice2Amperage.con
                  : 'null'}
              </td>
            </tr>
            <tr
              className="cursor-pointer"
              onClick={() => router.push('/device/my_device3')}
            >
              <th>my_device3</th>
              {/* <td>3rd Floor</td> */}
              <td>{myDevice3Voltage?.con ?? 'null'}</td>
              <td>{myDevice3Amperage?.con ?? 'null'}</td>
              <td>
                {myDevice3Voltage && myDevice3Amperage
                  ? myDevice3Voltage.con * myDevice3Amperage.con
                  : 'null'}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-2 flex justify-center">
          <Pagination
            current={page}
            total={total}
            pageSize={5}
            onChange={onChangePage}
            className="flex"
            itemRender={(currentPage, type, originalElement) => {
              if (type === 'prev') {
                return (
                  <button className="disabled:text-disabled mx-[2px] flex h-[32px] w-[32px] items-center justify-center"></button>
                );
              }
              if (type === 'next') {
                return (
                  <button className="disabled:text-disabled mx-[2px] flex h-[32px] w-[32px] items-center justify-center"></button>
                );
              }
              if (type === 'page') {
                return (
                  <button
                    className={clsx(
                      'mx-[2px] h-[32px] w-[32px] !rounded-[4px]',
                      currentPage === page && 'bg-neutral text-white',
                    )}
                  >
                    {currentPage}
                  </button>
                );
              }
              if (type === 'jump-next' || type === 'jump-prev') {
                return (
                  <button className="mx-[2px] h-[32px] w-[32px]">...</button>
                );
              }
              return originalElement;
            }}
          />
        </div>
      </div>
      {/* current */}
      <ChartCurrent
        series={[
          { name: 'my_device1', data: device1CurrentData, color: 'red' },
          { name: 'my_device2', data: device2CurrentData, color: 'green' },
          { name: 'my_device3', data: device3CurrentData, color: 'blue' },
        ]}
      />
      {/* temperature humidity */}
      <ChartTemperatureHumidity
        series={[
          { name: 'my_device1', data: device1TemperatureData, color: 'red' },
          { name: 'my_device2', data: device2TemperatureData, color: 'green' },
          { name: 'my_device3', data: device3TemperatureData, color: 'blue' },
        ]}
      />
    <div className="col-span-3 rounded-2xl border p-4 shadow-lg">
      <div className="text-[20px] font-bold mb-2">Map</div>
        <Map
        center={[36.35705, 128.1187]}
        zoom={7}
        markers={[
          { lat: 37.5509, lng: 127.0738, label: '세종대학교' },
          { lat: 35.1632, lng: 129.1636, label: '부산 해운대구' },
      ]}
      />
    </div>
    </div>
  );
}