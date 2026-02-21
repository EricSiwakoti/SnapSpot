import { useCallback, useEffect, useState } from "react";
import PlaceList from "../../places/components/PlaceList";
import UsersList from "../../user/components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient, API_BASE } from "../../shared/hooks/http-hook";
import Input from "../../shared/components/FormElements/Input";
import { useForm } from "../../shared/hooks/form-hook";
import Card from "../../shared/components/UIElements/Card";

const AllPlaces = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [searchResults, setSearchResults] = useState({ places: [], users: [] });
  const [activeTab, setActiveTab] = useState("places"); // 'places' | 'users' | 'all'

  // Search Form State
  const [formState, inputHandler] = useForm(
    {
      search: { value: "", isValid: true },
    },
    true,
  );

  // Fetch Search Results
  const fetchSearchResults = useCallback(
    async (searchTerm = "", type = "all") => {
      try {
        let url = `${API_BASE}/search?type=${type}`;
        if (searchTerm) {
          url += `&query=${encodeURIComponent(searchTerm)}`;
        }
        const responseData = await sendRequest(url);
        setSearchResults(responseData.results);
      } catch (err) {
        // Error handled in http-hook
      }
    },
    [sendRequest],
  );

  // Initial Load: Fetch all places for home feed
  useEffect(() => {
    fetchSearchResults("", "places");
  }, [fetchSearchResults]);

  // Search Submit Handler
  const searchSubmitHandler = (event) => {
    event.preventDefault();
    const searchTerm = formState.inputs.search.value.trim();
    fetchSearchResults(searchTerm, activeTab);
  };

  // Tab Change Handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const searchTerm = formState.inputs.search.value.trim();
    fetchSearchResults(searchTerm, tab);
  };

  // Handle Place Deletion
  const placeDeletedHandler = (deletedPlaceId) => {
    setSearchResults((prev) => ({
      ...prev,
      places: prev.places.filter((place) => place.id !== deletedPlaceId),
    }));
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />

      {/* Search Bar */}
      <form
        onSubmit={searchSubmitHandler}
        style={{
          maxWidth: "40rem",
          margin: "2rem auto",
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            id="search"
            element="input"
            type="text"
            label="Search Places or Users"
            placeholder="e.g. Berlin, John, Tower..."
            validators={[]}
            onInput={inputHandler}
          />
        </div>
        <button
          type="submit"
          className="button button--inverse"
          disabled={isLoading}
          style={{ marginTop: "1.8rem", height: "fit-content" }}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Search Type Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          className={`button ${activeTab === "all" ? "" : "button--inverse"}`}
          onClick={() => handleTabChange("all")}
          disabled={isLoading}
        >
          All
        </button>
        <button
          type="button"
          className={`button ${activeTab === "places" ? "" : "button--inverse"}`}
          onClick={() => handleTabChange("places")}
          disabled={isLoading}
        >
          Places
        </button>
        <button
          type="button"
          className={`button ${activeTab === "users" ? "" : "button--inverse"}`}
          onClick={() => handleTabChange("users")}
          disabled={isLoading}
        >
          Users
        </button>
      </div>

      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Show Places */}
          {(activeTab === "all" || activeTab === "places") && (
            <>
              {searchResults.places && searchResults.places.length > 0 && (
                <PlaceList
                  items={searchResults.places}
                  onDeletePlace={placeDeletedHandler}
                />
              )}
              {activeTab === "places" && searchResults.places?.length === 0 && (
                <div className="center">
                  <Card className="place-list__padding">
                    <h2>No places found.</h2>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Show Users */}
          {(activeTab === "all" || activeTab === "users") && (
            <>
              {searchResults.users && searchResults.users.length > 0 && (
                <UsersList items={searchResults.users} />
              )}
              {activeTab === "users" && searchResults.users?.length === 0 && (
                <div className="center">
                  <Card className="place-list__padding">
                    <h2>No users found.</h2>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Empty State for All */}
          {activeTab === "all" &&
            searchResults.places?.length === 0 &&
            searchResults.users?.length === 0 &&
            formState.inputs.search.value.trim() !== "" && (
              <div className="center">
                <Card className="place-list__padding">
                  <h2>
                    No results found for &quot;{formState.inputs.search.value}
                    &quot;.
                  </h2>
                </Card>
              </div>
            )}
        </>
      )}
    </>
  );
};

export default AllPlaces;
