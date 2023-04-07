const alertClasses = "alert shadow-lg mb-8 mt-4 transition-all"
// TODO: ^ Fix this transition ^

const SuggestionAlert = ({suggestion, showSuggestion, onDismissClick}) => {
  return (
    <div className={showSuggestion ? `${alertClasses} opacity-1` : `${alertClasses} opacity-0 hidden m-0 p-0`}>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
          <h3 className="font-bold">MangiaBot Suggestion</h3>
          <div>{suggestion.quantity} {suggestion.unit} {suggestion.ingredient}</div>
        </div>
      </div>
      <div className="flex-none">
        <button className="btn btn-sm btn-secondary" onClick={onDismissClick} type="button">Dismiss</button>
      </div>
    </div>
  )
}

export default SuggestionAlert
