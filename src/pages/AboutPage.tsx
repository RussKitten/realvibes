import { GOST_SIZES_TABLE } from '../gost/constants';

export function AboutPage(): JSX.Element {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl rounded border border-gray-300 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Соответствие ГОСТ 19.701-90 (ЕСПД)
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Приложение реализует стандартные символы схем алгоритмов, программ, данных и систем.
          Размеры блоков заданы пропорционально, чтобы обеспечить читаемость при экспорте. Ниже
          приведена сводная таблица: тип блока — обозначение — базовые размеры по ГОСТ.
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Тип блока</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Обозначение ГОСТ</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Размеры</th>
            </tr>
          </thead>
          <tbody>
            {GOST_SIZES_TABLE.map((row) => (
              <tr key={row.kind}>
                <td className="border border-gray-400 px-3 py-2">{row.labelRu}</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">{row.gostCode}</td>
                <td className="border border-gray-400 px-3 py-2">{row.dimensions}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-6 mb-2 text-base font-semibold text-gray-900">
          Оформление листингов (ГОСТ 2.105-95)
        </h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Шрифт — моноширинный (Courier New), размер 10–12 пт.</li>
          <li>Межстрочный интервал — одинарный.</li>
          <li>Таблица: две колонки, все границы видимы, выравнивание кода по левому краю.</li>
          <li>Подпись — над таблицей: «Листинг N — …».</li>
          <li>Номер строки — по центру, ширина колонки по умолчанию 1,5 см.</li>
        </ul>

        <h3 className="mt-6 mb-2 text-base font-semibold text-gray-900">Горячие клавиши</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Колесо мыши — зум схемы.</li>
          <li>Пробел + перетаскивание — панорамирование.</li>
          <li>Delete/Backspace — удалить выбранный блок.</li>
          <li>Потянуть за маркер узла — создать соединение.</li>
        </ul>
      </div>
    </div>
  );
}
