import { useState } from "react";
import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../src/components/UI";
it("returns focus to the opening control when a gallery dialog closes", async () => {
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Edit collection</button>
        {open && (
          <Modal title="Edit collection" onClose={() => setOpen(false)}>
            <p>Collection editor</p>
          </Modal>
        )}
      </>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  const trigger = screen.getByRole("button", { name: "Edit collection" });
  await user.click(trigger);
  expect(screen.getByRole("dialog")).toHaveAccessibleName("Edit collection");
  await user.click(screen.getByRole("button", { name: "Close dialog" }));
  expect(trigger).toHaveFocus();
});
