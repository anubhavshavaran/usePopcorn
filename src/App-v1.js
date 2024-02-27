import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [];
const tempWatchedData = [];
const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
// const KEY = '66c3d03a';
const KEY = 'f84fc31d';

function Search({query, setQuery}) {
  return <input
  className="search"
  type="text"
  placeholder="Search movies..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
}

function NumResults({movies}) {
  return <p className="num-results">Found <strong>{movies.length}</strong> results</p>
}

function Logo() {
  return <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
}

function NavBar({children}) {
  return(
    <nav className="nav-bar">{children}</nav>
  );
}

function Main({children}) {
  return(
    <main className="main">
      {children}
    </main>
  );
}

function MovieList({movies, onSelectMovie}) {

  return(
    <ul className="list">
      {movies?.map((movie) => <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie}/>)}
    </ul>
  );
}

function Movie({movie, onSelectMovie}) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)} >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);

  return(
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function WatchedSummary({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return(
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({watched}) {
  return(
    <ul className="list list-movies">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const {
    Title: title,
    Year: year,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    Poster: poster
  } = movie;

  console.log(title, genre);

  function handleAddWatched() {
    const newWatchedMovie = {
      imdbRating: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0))
    }
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true);
      
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      
      setMovie(data);
      setIsLoading(false);
    }

    getMovieDetails();
  }, [selectedId]);

  useEffect(function () {
    if (!title) return;
    document.title = `Movie | ${title}`;
    
    return function () {
      document.title = `usePocorn`;
      console.log(`Clean up effect for movie ${title}`);
    }
  }, [title]);

  useEffect(function () {
    function callBack(e) {
      if (e.code === "Escape") {
        onCloseMovie();
      }
    }

    document.addEventListener('keydown', callBack);

    return function () {
      document.removeEventListener('keydown', callBack);
    }
  }, [onCloseMovie]);

  return <div className="details">
    <header>
      <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
      <img src={poster} alt={`Poster of ${title}`} />
      <div className="details-overview">
        <h2>{title}</h2>
        <p>{released} &bull; {runtime}</p>
        <p>{genre}</p>
        <p>
          <span>⭐</span>
          {imdbRating} IMDb rating
        </p>
      </div>
    </header>

    <section>
      <StarRating maxRating={10} size={24}/>
      <button className="btn-add" onClick={handleAddWatched}>+ Add the Movie Watched list</button>
      <p><em>{plot}</em></p>
      <p>Starring {actors}</p>
      <p>Directed by {director}</p>
    </section>
    {selectedId}
  </div>
}

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectMovie(id) {
    setSelectedId(sid => id === sid ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched(movies => [...movies, movie])
  }

  useEffect(function () {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
  
        if (!res.ok) throw new Error("Something went wrong!");
  
        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not Found!");

        setMovies(data.Search);
      } catch(err) {
        if (err.name !== "AbortError") {
          console.error(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }

    handleCloseMovie();
    fetchMovies();

    return function () {
      controller.abort();
    }
  }, [query]);

  return (
    <>
    <NavBar>
      <Logo/>
      <Search query={query} setQuery={setQuery}/>
      <NumResults movies={movies}/>
    </NavBar>
    <Main>
      {/* <Box element={<MovieList movies={movies}/>} />
      <Box 
        element={
          <>
            <WatchedSummary watched={watched} />
            <WatchedMoviesList watched={watched} />
          </>
        }
      /> */}

      <Box>
        {/* {isLoading ? <Loader /> : <MovieList movies={movies}/>} */}
        {isLoading && <Loader/>}
        {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
        {error && <ErrorMessage message={error} />}
      </Box>
      <Box>
        {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} /> : 
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>}
      </Box>

    </Main>
    </>
  );
}

function ErrorMessage({message}) {
  return <p className="error">
    <span>⛔</span> {message}
  </p>
}

function Loader() {
  return <h1>Loading...</h1>
}