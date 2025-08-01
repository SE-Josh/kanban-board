export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-12">
      <div className="flex gap-4 p-4">
        <div className="bg-base-200 p-2 rounded-lg w-50 h-100">
          <h2 className="text-lg font-bold mb-2">代辦事項（腦力激盪）</h2>
          <div className="flex flex-col gap-3">
            <div className="card bg-white shadow">
              <div className="card-body">
                <h3 className="card-title">Task A</h3>
                <p>細節描述</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
