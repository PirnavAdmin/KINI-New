function TemplateSelector({
  selectedTemplate,
  setSelectedTemplate,
}) {
  return (
    <div className="grid md:grid-cols-3 gap-5">

      {[1, 2, 3].map(
        (template) => (
          <div
            key={template}
            onClick={() =>
              setSelectedTemplate(
                template
              )
            }
            className={`cursor-pointer rounded-3xl p-5 border-2 ${
              selectedTemplate ===
              template
                ? "border-blue-600"
                : "border-gray-200"
            }`}
          >

            <img
              src={`https://placehold.co/400x500?text=Template+${template}`}
              alt=""
              className="rounded-2xl"
            />

          </div>
        )
      )}

    </div>
  );
}

export default TemplateSelector;