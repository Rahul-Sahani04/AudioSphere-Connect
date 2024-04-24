import { Vortex } from "./Components/ui/vortex";
import { Link } from "react-router-dom";
export function App() {
  return (
    <div className="mx-auto rounded-md h-screen overflow-hidden">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
          Welcome to <span className="text-[#C147E9]"> Audio </span> Sphere!
        </h2>
        <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
          Listen to music together with your friends in real-time.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link to={"/home"}>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]">
              Start Listening
            </button>
          </Link>
          <button className="px-4 py-2 text-white">Learn More</button>
        </div>
      </Vortex>
    </div>
  );
}

export default App;
