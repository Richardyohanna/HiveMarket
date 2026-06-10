package error;

@SuppressWarnings("serial")
public class ReactionNotFoundException extends RuntimeException {

	public ReactionNotFoundException(String message) {
		super(message);
	}
}
